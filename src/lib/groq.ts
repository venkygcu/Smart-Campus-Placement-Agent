/**
 * groq.ts — AI integration with RAG-aware, token-efficient prompts
 *
 * Cost optimizations applied:
 * 1. Resume parsing     → llama-3.1-8b-instant  (fast + cheap, structured task)
 * 2. Project analysis   → llama-3.1-8b-instant  (one-time per project, cached in DB)
 * 3. Candidate scoring  → llama-3.1-8b-instant  (structured JSON in, JSON out — no raw text)
 *
 * RAG approach for candidate scoring:
 *  - We NEVER send raw resume text to the shortlisting call.
 *  - Only the already-extracted, structured profile fields are sent.
 *  - The aiAnalysis stored per project acts as a "retrieval" cache so we
 *    don't re-analyze job requirements on every application.
 *  - Results (score, category, reasoning) are stored per application so
 *    the same candidate is never scored twice for the same job.
 */

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

// ── Models ────────────────────────────────────────────────────────────────────
// Use the cheapest model that handles structured JSON reliably.
// llama-3.1-8b-instant: ~8x cheaper than 70b, still excellent for JSON tasks.
const MODEL_FAST = "llama-3.1-8b-instant";
// Use 70b only for complex analysis that truly needs reasoning depth.
const MODEL_STRONG = "llama-3.3-70b-versatile";

// ── Helper: safe JSON parse ───────────────────────────────────────────────────
function safeParse(text: string): Record<string, unknown> {
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { /* fall through */ }
    }
    return {};
  }
}

function cleanResumeText(text: string): string {
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ── 1. Resume Parsing ─────────────────────────────────────────────────────────
// Called once per resume upload. Result is stored in studentProfiles.
// Raw resume text is pre-truncated to ≤4000 chars by the route before calling this.
export async function extractResumeData(resumeText: string) {
  // Clean PDF encoding artifacts before sending to LLM
  const cleanedInput = cleanResumeText(resumeText);

  const completion = await groq.chat.completions.create({
    model: MODEL_FAST,
    messages: [
      {
        role: "system",
        content: `You are a resume parser. Extract structured data and return ONLY valid JSON (no markdown, no explanation):
{
  "fullName":"","email":"","phone":"","location":"","college":"","degree":"","branch":"",
  "graduationYear":null,"cgpa":null,
  "skills":[],"experience":[],"projects":[],
  "achievements":"","linkedinUrl":null,"githubUrl":null,"portfolioUrl":null,
  "bio":""
}
IMPORTANT for skills: extract ONLY the skill name as a clean plain string. No bullet points, no quotes, no special characters at the start or end. Example: ["React", "Python", "Next.js"]
CRITICAL URL RULES:
- "linkedinUrl": ONLY if URL contains "linkedin.com"
- "githubUrl": ONLY if URL contains "github.com"
- "portfolioUrl": any other personal website
- NEVER mix these up. If it doesn't match, set null.
For experience: [{company,role,duration,description}]
For projects: [{name,description,technologies:[]}]
Return only JSON.`,
      },
      {
        role: "user",
        content: cleanedInput,
      },
    ],
    temperature: 0,
    max_tokens: 1500,
  });

  const data = safeParse(completion.choices[0]?.message?.content || "{}");
  
  // Clean skills array if present
  if (Array.isArray(data.skills)) {
    data.skills = data.skills.map((s: any) => String(s).trim().replace(/^[-•*]\s*/, ""));
  }

  return data;
}

// ── 2. Project / Job Description Analysis ────────────────────────────────────
// Called ONCE per project creation. Result saved to projects.aiAnalysis in DB.
// Subsequent candidate evaluations read from DB — this function is NOT called again.
export async function analyzeProject(
  title: string,
  description: string,
  minReqs: string,
  preferredReqs: string,
  type: string
) {
  const completion = await groq.chat.completions.create({
    model: MODEL_STRONG, // Use stronger model here (one-time cost per project)
    messages: [
      {
        role: "system",
        content: `Analyze a ${type} job posting and return ONLY valid JSON (no markdown):
{
  "summary":"2-3 sentence role summary",
  "requiredSkills":[],"preferredSkills":[],
  "minCgpa":null,
  "keyResponsibilities":[],
  "idealCandidateProfile":"",
  "difficulty":"entry|mid|senior",
  "tags":[]
}`,
      },
      {
        role: "user",
        content: `Title: ${title}\nDescription: ${description}\nMin Requirements: ${minReqs || "None"}\nPreferred: ${preferredReqs || "None"}`,
      },
    ],
    temperature: 0.1,
    max_tokens: 1000,
  });

  return safeParse(completion.choices[0]?.message?.content || "{}");
}

// ── 3. RAG Candidate Shortlisting ────────────────────────────────────────────
// RAG design:
//  - "Context" = pre-extracted structured profile (NOT raw resume text)
//  - "Query"   = project requirements (pre-analyzed, pulled from DB cache)
//  - "Result"  = stored per application; never re-computed for same pair
//
// Token savings vs naive approach:
//  - Naive: raw resume text (~2000 tokens) + job description (~500 tokens) = ~2500/call
//  - RAG:   structured JSON (~300 tokens) + cached requirements (~200 tokens) = ~500/call
//  - Savings: ~80% token reduction per application evaluation
export async function shortlistCandidate(
  // Structured profile — already extracted from resume, stored in DB
  studentProfile: {
    skills: string[];
    cgpa: number | null;
    degree: string | null;
    branch: string | null;
    graduationYear: number | null;
    experience: Array<{ role: string; company: string; duration: string }>;
    projects: Array<{ name: string; technologies: string[] }>;
    bio?: string;
    fullName?: string;
  },
  // Pre-analyzed job data — read from projects.aiAnalysis (cached in DB)
  projectRequirements: {
    requiredSkills: string[];
    preferredSkills: string[];
    minCgpa: number | null;
    minimumRequirements: string;
    preferredRequirements: string;
    type: string;
    difficulty?: string;
  }
) {
  // Build a minimal, token-efficient context string
  const candidateContext = buildCandidateContext(studentProfile);
  const requirementsContext = buildRequirementsContext(projectRequirements);

  const completion = await groq.chat.completions.create({
    model: MODEL_FAST,
    messages: [
      {
        role: "system",
        content: `You are a technical recruiter AI. Score candidates objectively.
Rules: score>=80→highly_recommended, 50-79→minimum_met, <50→not_qualified
Return ONLY valid JSON (no markdown):
{"score":0,"category":"not_qualified","skillMatch":0,"reasoning":"","strengths":[],"gaps":[]}`,
      },
      {
        role: "user",
        content: `CANDIDATE:\n${candidateContext}\n\nJOB REQUIREMENTS:\n${requirementsContext}`,
      },
    ],
    temperature: 0,
    max_tokens: 400, // Short structured response only
  });

  const result = safeParse(completion.choices[0]?.message?.content || "{}");

  // Validate and normalize
  return {
    score: Number(result.score) || 0,
    category: validateCategory(result.category as string),
    skillMatch: Number(result.skillMatch) || 0,
    reasoning: String(result.reasoning || "Analysis complete"),
    strengths: Array.isArray(result.strengths) ? result.strengths : [],
    gaps: Array.isArray(result.gaps) ? result.gaps : [],
  };
}

// ── Context builders (keep token count minimal) ───────────────────────────────

function buildCandidateContext(p: Parameters<typeof shortlistCandidate>[0]): string {
  const lines: string[] = [];

  if (p.skills.length) lines.push(`Skills: ${p.skills.slice(0, 20).join(", ")}`);
  if (p.cgpa) lines.push(`CGPA: ${p.cgpa}`);
  if (p.degree) lines.push(`Education: ${p.degree}${p.branch ? " – " + p.branch : ""}`);
  if (p.graduationYear) lines.push(`Graduation: ${p.graduationYear}`);

  if (p.experience.length) {
    const exp = p.experience.slice(0, 3).map((e) => `${e.role} at ${e.company} (${e.duration})`).join("; ");
    lines.push(`Experience: ${exp}`);
  }

  if (p.projects.length) {
    const proj = p.projects.slice(0, 3).map((pr) => `${pr.name} [${(pr.technologies || []).slice(0, 4).join(", ")}]`).join("; ");
    lines.push(`Projects: ${proj}`);
  }

  return lines.join("\n");
}

function buildRequirementsContext(r: Parameters<typeof shortlistCandidate>[1]): string {
  const lines: string[] = [];

  if (r.requiredSkills.length) lines.push(`Required skills: ${r.requiredSkills.join(", ")}`);
  if (r.preferredSkills.length) lines.push(`Preferred skills: ${r.preferredSkills.join(", ")}`);
  if (r.minCgpa) lines.push(`Min CGPA: ${r.minCgpa}`);
  if (r.type) lines.push(`Type: ${r.type}`);
  if (r.minimumRequirements) lines.push(`Requirements: ${r.minimumRequirements.slice(0, 200)}`);

  return lines.join("\n");
}

function validateCategory(cat: string): "highly_recommended" | "minimum_met" | "not_qualified" {
  if (cat === "highly_recommended" || cat === "minimum_met" || cat === "not_qualified") return cat;
  return "not_qualified";
}

export { groq };
