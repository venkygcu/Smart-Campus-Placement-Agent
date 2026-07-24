"use client";
import { useState, useCallback, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDropzone } from "react-dropzone";
import SkillsInput from "@/components/SkillsInput";

type Role = "student" | "recruiter" | null;
type Step = "role" | "resume" | "review" | "recruiter-form";

interface StudentProfile {
  fullName: string; email: string; phone: string; college: string;
  degree: string; branch: string; graduationYear: string; cgpa: string;
  skills: string[]; experience: unknown[]; projects: unknown[];
  achievements: string; linkedinUrl: string; githubUrl: string;
  portfolioUrl: string; bio: string; location: string; resumeText: string;
  password: string;
}

const BLANK_STUDENT: StudentProfile = {
  fullName: "", email: "", phone: "", college: "", degree: "", branch: "",
  graduationYear: "", cgpa: "", skills: [], experience: [], projects: [],
  achievements: "", linkedinUrl: "", githubUrl: "", portfolioUrl: "",
  bio: "", location: "", resumeText: "", password: "",
};

const BLANK_RECRUITER = {
  fullName: "", email: "", phone: "", companyName: "", companyWebsite: "",
  companySize: "", industry: "", designation: "", location: "", password: "",
};

const STEP_LABELS: Record<string, string[]> = {
  student: ["Select role", "Upload resume", "Review & create account"],
  recruiter: ["Select role", "Company details & create account"],
};

function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="steps" style={{ marginBottom: 28 }}>
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="step" style={{ flex: 1, gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
              <div className={`step-num ${done ? "done" : active ? "current" : "pending"}`}>
                {done ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : i + 1}
              </div>
              <span className={`step-label ${active ? "current" : ""}`} style={{ display: i < steps.length - 1 ? "none" : "block" }}>
                {label}
              </span>
              {i < steps.length - 1 && (
                <>
                  <div className={`step-line ${done ? "done" : ""}`} />
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SignUpInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [role, setRole] = useState<Role>((params.get("role") as Role) || null);
  const [step, setStep] = useState<Step>(params.get("role") ? (params.get("role") === "student" ? "resume" : "recruiter-form") : "role");
  const [student, setStudent] = useState<StudentProfile>(BLANK_STUDENT);
  const [recruiter, setRecruiter] = useState(BLANK_RECRUITER);
  const [parseLoading, setParseLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [skillInput, setSkillInput] = useState("");

  const stepIndex = role === "recruiter"
    ? ["role", "recruiter-form"].indexOf(step)
    : ["role", "resume", "review"].indexOf(step);

  const steps = role === "recruiter" ? STEP_LABELS.recruiter : STEP_LABELS.student;

  const onDrop = useCallback(async (accepted: File[]) => {
    if (!accepted.length) return;
    setParseLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("resume", accepted[0]);
      const res = await fetch("/api/resume/parse", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Parse failed");
      const d = data.data;
      setStudent((p) => ({
        ...p,
        fullName: d.fullName || p.fullName,
        email: d.email || p.email,
        phone: d.phone || p.phone,
        college: d.college || p.college,
        degree: d.degree || p.degree,
        branch: d.branch || p.branch,
        graduationYear: d.graduationYear?.toString() || p.graduationYear,
        cgpa: d.cgpa?.toString() || p.cgpa,
        skills: d.skills?.length ? d.skills : p.skills,
        experience: d.experience || p.experience,
        projects: d.projects || p.projects,
        achievements: d.achievements || p.achievements,
        linkedinUrl: d.linkedinUrl || p.linkedinUrl,
        githubUrl: d.githubUrl || p.githubUrl,
        portfolioUrl: d.portfolioUrl || p.portfolioUrl,
        bio: d.bio || p.bio,
        location: d.location || p.location,
        resumeText: data.rawText || "",
      }));
      setStep("review");
    } catch (e: unknown) {
      setError((e as Error).message || "Failed to parse resume");
    } finally {
      setParseLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [], "image/*": [], "text/plain": [] },
    maxFiles: 1,
    disabled: parseLoading,
  });

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !student.skills.includes(s)) {
      setStudent((p) => ({ ...p, skills: [...p.skills, s] }));
      setSkillInput("");
    }
  };

  const submit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const email = role === "student" ? student.email : recruiter.email;
      const password = role === "student" ? student.password : recruiter.password;
      const profile = role === "student"
        ? { ...student, cgpa: parseFloat(student.cgpa) || null, graduationYear: parseInt(student.graduationYear) || null, password: undefined }
        : { ...recruiter, password: undefined };

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role, profile }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Sign up failed"); setSubmitting(false); return; }
      router.push(role === "student" ? "/student/dashboard" : "/recruiter/dashboard");
    } catch {
      setError("Something went wrong.");
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-0)", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <header style={{ height: 52, borderBottom: "1px solid var(--border-0)", display: "flex", alignItems: "center", padding: "0 28px", justifyContent: "space-between", flexShrink: 0 }}>
        <Link href="/" className="nav-logo">
          <span className="logo-icon">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M2 7l3.5 3.5L12 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          PlaceAI
        </Link>
        <span style={{ fontSize: 13, color: "var(--text-2)" }}>
          Have an account?{" "}
          <Link href="/sign-in" style={{ color: "var(--blue)", textDecoration: "none", fontWeight: 600 }}>Sign in</Link>
        </span>
      </header>

      <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 24px 60px" }}>
        <div style={{ width: "100%", maxWidth: role === "student" && step === "review" ? 700 : 480 }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 6 }}>Create account</h1>
            <p style={{ fontSize: 13, color: "var(--text-2)" }}>Join PlaceAI — it&apos;s free.</p>
          </div>

          {role && <StepIndicator steps={steps} current={stepIndex} />}

          {/* ── Role Step ── */}
          {step === "role" && (
            <div>
              <p style={{ fontSize: 13, color: "var(--text-1)", marginBottom: 16 }}>What best describes you?</p>
              <div className="grid-2" style={{ gap: 12, marginBottom: 20 }}>
                {([
                  { r: "student" as Role, title: "Student", sub: "Looking for internships or placements. Upload a resume and let AI handle the rest." },
                  { r: "recruiter" as Role, title: "Recruiter", sub: "Hiring for your company. Post drives, share a unique link, review ranked applicants." },
                ] as { r: Role; title: string; sub: string }[]).map(({ r, title, sub }) => (
                  <button
                    key={r!}
                    type="button"
                    onClick={() => { setRole(r); }}
                    style={{
                      padding: "20px", textAlign: "left", cursor: "pointer",
                      background: role === r ? "var(--blue-dim)" : "var(--bg-1)",
                      border: `1px solid ${role === r ? "var(--blue-border)" : "var(--border-1)"}`,
                      borderRadius: "var(--radius-6)", transition: "var(--t)", width: "100%",
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, color: role === r ? "var(--blue)" : "var(--text-0)", marginBottom: 6 }}>{title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6 }}>{sub}</div>
                  </button>
                ))}
              </div>
              <button
                className="btn btn-primary"
                style={{ width: "100%", height: 40 }}
                disabled={!role}
                onClick={() => setStep(role === "student" ? "resume" : "recruiter-form")}
              >
                Continue
              </button>
            </div>
          )}

          {/* ── Resume Upload ── */}
          {step === "resume" && role === "student" && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Upload your resume</h2>
              <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 20 }}>AI will extract your details automatically. Supports PDF, image, or plain text.</p>

              <div {...getRootProps()} className={`dropzone ${isDragActive ? "active" : ""}`} style={{ marginBottom: 16 }}>
                <input {...getInputProps()} />
                {parseLoading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="spin" style={{ width: 24, height: 24 }} />
                    <span style={{ fontSize: 13, color: "var(--text-2)" }}>Parsing with AI...</span>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-0)", marginBottom: 4 }}>
                      {isDragActive ? "Drop file to parse" : "Drag file here, or click to browse"}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-3)" }}>PDF · Image · TXT — max 10 MB</div>
                  </div>
                )}
              </div>

              {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}

              <div className="flex justify-between">
                <button className="btn btn-ghost btn-sm" onClick={() => setStep("role")}>Back</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setStep("review")}>Skip — fill manually</button>
              </div>
            </div>
          )}

          {/* ── Student Review Step ── */}
          {step === "review" && role === "student" && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Review your profile</h2>
              <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 20 }}>AI has pre-filled what it could. Correct anything and set your password.</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Personal */}
                <div className="card card-p">
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 12 }}>Personal information</div>
                  <div className="grid-2" style={{ gap: 12 }}>
                    <InputF label="Full name" value={student.fullName} onChange={(v) => setStudent((p) => ({ ...p, fullName: v }))} placeholder="Jane Doe" />
                    <InputF label="Email" type="email" value={student.email} onChange={(v) => setStudent((p) => ({ ...p, email: v }))} placeholder="jane@example.com" />
                    <InputF label="Phone" value={student.phone} onChange={(v) => setStudent((p) => ({ ...p, phone: v }))} placeholder="+91 98765 43210" />
                    <InputF label="Location" value={student.location} onChange={(v) => setStudent((p) => ({ ...p, location: v }))} placeholder="Bangalore, India" />
                  </div>
                </div>

                {/* Education */}
                <div className="card card-p">
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 12 }}>Education</div>
                  <div className="grid-2" style={{ gap: 12 }}>
                    <div className="col-span-2">
                      <InputF label="College / University" value={student.college} onChange={(v) => setStudent((p) => ({ ...p, college: v }))} placeholder="IIT Delhi" />
                    </div>
                    <InputF label="Degree" value={student.degree} onChange={(v) => setStudent((p) => ({ ...p, degree: v }))} placeholder="B.Tech" />
                    <InputF label="Branch / Major" value={student.branch} onChange={(v) => setStudent((p) => ({ ...p, branch: v }))} placeholder="Computer Science" />
                    <InputF label="Graduation year" type="number" value={student.graduationYear} onChange={(v) => setStudent((p) => ({ ...p, graduationYear: v }))} placeholder="2025" />
                    <InputF label="CGPA" type="number" value={student.cgpa} onChange={(v) => setStudent((p) => ({ ...p, cgpa: v }))} placeholder="8.5" />
                  </div>
                </div>

                {/* Skills */}
                <div className="card card-p">
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 12 }}>Skills</div>
                  <SkillsInput
                    value={student.skills}
                    onChange={(skills) => setStudent((p) => ({ ...p, skills }))}
                  />
                </div>

                {/* Links */}
                <div className="card card-p">
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 12 }}>Links</div>
                  <div className="grid-2" style={{ gap: 12 }}>
                    <InputF label="LinkedIn" value={student.linkedinUrl} onChange={(v) => setStudent((p) => ({ ...p, linkedinUrl: v }))} placeholder="https://linkedin.com/in/..." />
                    <InputF label="GitHub" value={student.githubUrl} onChange={(v) => setStudent((p) => ({ ...p, githubUrl: v }))} placeholder="https://github.com/..." />
                    <div className="col-span-2">
                      <InputF label="Portfolio" value={student.portfolioUrl} onChange={(v) => setStudent((p) => ({ ...p, portfolioUrl: v }))} placeholder="https://yoursite.com" />
                    </div>
                  </div>
                </div>

                {/* Account credentials */}
                <div className="card card-p">
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 12 }}>Account credentials</div>
                  <div className="grid-2" style={{ gap: 12 }}>
                    <InputF label="Password" type="password" value={student.password} onChange={(v) => setStudent((p) => ({ ...p, password: v }))} placeholder="Create a strong password" />
                  </div>
                </div>
              </div>

              {error && <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>}

              <div className="flex justify-between" style={{ marginTop: 20 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setStep("resume")}>Back</button>
                <button className="btn btn-primary" onClick={submit} disabled={submitting || !student.email || !student.fullName || !student.password}>
                  {submitting ? <><div className="spin" />Creating account...</> : "Create account"}
                </button>
              </div>
            </div>
          )}

          {/* ── Recruiter Form ── */}
          {step === "recruiter-form" && role === "recruiter" && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Company &amp; account details</h2>
              <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 20 }}>Fill in your company info and set a password.</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="card card-p">
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 12 }}>Contact information</div>
                  <div className="grid-2" style={{ gap: 12 }}>
                    <InputF label="Full name" value={recruiter.fullName} onChange={(v) => setRecruiter((p) => ({ ...p, fullName: v }))} placeholder="Jane Smith" />
                    <InputF label="Email" type="email" value={recruiter.email} onChange={(v) => setRecruiter((p) => ({ ...p, email: v }))} placeholder="jane@company.com" />
                    <InputF label="Phone" value={recruiter.phone} onChange={(v) => setRecruiter((p) => ({ ...p, phone: v }))} placeholder="+91 98765 43210" />
                    <InputF label="Designation" value={recruiter.designation} onChange={(v) => setRecruiter((p) => ({ ...p, designation: v }))} placeholder="HR Manager" />
                  </div>
                </div>

                <div className="card card-p">
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 12 }}>Company</div>
                  <div className="grid-2" style={{ gap: 12 }}>
                    <InputF label="Company name *" value={recruiter.companyName} onChange={(v) => setRecruiter((p) => ({ ...p, companyName: v }))} placeholder="Acme Inc." />
                    <InputF label="Industry" value={recruiter.industry} onChange={(v) => setRecruiter((p) => ({ ...p, industry: v }))} placeholder="Technology" />
                    <div className="field">
                      <label className="label">Company size</label>
                      <select className="input select" value={recruiter.companySize} onChange={(e) => setRecruiter((p) => ({ ...p, companySize: e.target.value }))}>
                        <option value="">Select...</option>
                        <option>1–10</option><option>11–50</option><option>51–200</option>
                        <option>201–1000</option><option>1000+</option>
                      </select>
                    </div>
                    <InputF label="Location" value={recruiter.location} onChange={(v) => setRecruiter((p) => ({ ...p, location: v }))} placeholder="Bangalore, India" />
                    <div className="col-span-2">
                      <InputF label="Website" value={recruiter.companyWebsite} onChange={(v) => setRecruiter((p) => ({ ...p, companyWebsite: v }))} placeholder="https://company.com" />
                    </div>
                  </div>
                </div>

                <div className="card card-p">
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 12 }}>Account credentials</div>
                  <InputF label="Password" type="password" value={recruiter.password} onChange={(v) => setRecruiter((p) => ({ ...p, password: v }))} placeholder="Create a strong password" />
                </div>
              </div>

              {error && <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>}

              <div className="flex justify-between" style={{ marginTop: 20 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setStep("role")}>Back</button>
                <button className="btn btn-primary" onClick={submit} disabled={submitting || !recruiter.companyName || !recruiter.email || !recruiter.password}>
                  {submitting ? <><div className="spin" />Creating account...</> : "Create account"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InputF({ label, type = "text", value, onChange, placeholder }: {
  label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      <input type={type} className="input" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpInner />
    </Suspense>
  );
}
