import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects, applications, studentProfiles } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { shortlistCandidate } from "@/lib/groq";
import { generateId } from "@/lib/utils";
import { eq, and } from "drizzle-orm";

// GET /api/projects/[slug]/applications — get all applications for a project (recruiter only)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "recruiter") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const [project] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const apps = await db
      .select({ application: applications, student: studentProfiles })
      .from(applications)
      .innerJoin(studentProfiles, eq(applications.studentId, studentProfiles.id))
      .where(eq(applications.projectId, project.id));

    const categorized = {
      highly_recommended: apps.filter((a) => a.application.aiCategory === "highly_recommended"),
      minimum_met:        apps.filter((a) => a.application.aiCategory === "minimum_met"),
      not_qualified:      apps.filter((a) => a.application.aiCategory === "not_qualified"),
      applied:            apps.filter((a) => !a.application.aiCategory),
    };

    return NextResponse.json({ project, applications: apps, categorized });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/projects/[slug]/applications — student applies to a project
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const { coverLetter } = await req.json().catch(() => ({ coverLetter: "" }));

    const [project] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    if (project.status !== "active")
      return NextResponse.json({ error: "Project is not accepting applications" }, { status: 400 });

    const [student] = await db
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.userId, session.userId))
      .limit(1);
    if (!student) return NextResponse.json({ error: "Student profile not found" }, { status: 404 });

    // Deduplication — never score the same student-project pair twice
    const [existing] = await db
      .select()
      .from(applications)
      .where(and(eq(applications.projectId, project.id), eq(applications.studentId, student.id)))
      .limit(1);

    if (existing) {
      // Return cached result — no Groq call needed
      return NextResponse.json({
        success: true,
        cached: true,
        aiResult: {
          score: existing.aiScore,
          category: existing.aiCategory,
          skillMatch: existing.skillMatch,
          reasoning: existing.aiReasoning,
        },
      });
    }

    // ── RAG shortlisting ──────────────────────────────────────────────────────
    // Build structured candidate context (NOT raw resume text — major token saving)
    const skills: string[] = safeParseArray(student.skills);
    const experience = safeParseArray<{ role: string; company: string; duration: string; description: string }>(student.experience);
    const studentProjects = safeParseArray<{ name: string; description: string; technologies: string[] }>(student.projects);

    // Pull AI-analyzed requirements from DB (cached per project — no re-analysis)
    const aiAnalysis = safeParseObject(project.aiAnalysis);
    const requiredSkills: string[] = safeParseArray(project.requiredSkills) || (aiAnalysis.requiredSkills as string[]) || [];
    const preferredSkills: string[] = safeParseArray(project.preferredSkills) || (aiAnalysis.preferredSkills as string[]) || [];

    const studentData = {
      fullName: student.fullName,
      skills,
      cgpa: student.cgpa,
      degree: student.degree,
      branch: student.branch,
      graduationYear: student.graduationYear,
      experience: experience.map((e) => ({ role: e.role, company: e.company, duration: e.duration })),
      projects: studentProjects.map((p) => ({ name: p.name, technologies: p.technologies || [] })),
      bio: student.bio || undefined,
    };

    const projectData = {
      requiredSkills,
      preferredSkills,
      minCgpa: project.minCgpa,
      minimumRequirements: project.minimumRequirements || "",
      preferredRequirements: project.preferredRequirements || "",
      type: project.type,
      difficulty: (aiAnalysis.difficulty as string) || undefined,
    };

    const aiResult = await shortlistCandidate(studentData, projectData);

    // Store result — future calls for this pair return the cached version
    const appId = generateId();
    await db.insert(applications).values({
      id: appId,
      projectId: project.id,
      studentId: student.id,
      status: "applied",
      aiScore: aiResult.score,
      aiCategory: aiResult.category,
      aiReasoning: aiResult.reasoning,
      skillMatch: aiResult.skillMatch,
      coverLetter: coverLetter || null,
    });

    return NextResponse.json({ success: true, aiResult });
  } catch (err) {
    console.error("Application error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── Util: safe JSON parse helpers ────────────────────────────────────────────
function safeParseArray<T = string>(val: string | null | undefined): T[] {
  if (!val) return [];
  try { return JSON.parse(val) as T[]; } catch { return []; }
}

function safeParseObject(val: string | null | undefined): Record<string, unknown> {
  if (!val) return {};
  try { return JSON.parse(val) as Record<string, unknown>; } catch { return {}; }
}
