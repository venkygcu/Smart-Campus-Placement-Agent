"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Project {
  id: string; title: string; type: string; companyName: string;
  description: string; location: string; salaryMin: number; salaryMax: number;
  duration: string; openings: number; deadline: string;
  requiredSkills: string; preferredSkills: string; aiAnalysis: string;
  minimumRequirements: string;
}

export default function ApplyPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [result, setResult] = useState<{ success: boolean; aiResult?: Record<string, unknown>; error?: string } | null>(null);
  const [notLoggedIn, setNotLoggedIn] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${slug}`)
      .then((r) => r.json())
      .then((d) => setProject(d.project))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleApply = async () => {
    setApplying(true);
    const res = await fetch(`/api/projects/${slug}/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coverLetter }),
    });
    const data = await res.json();
    if (res.status === 401) { setNotLoggedIn(true); setApplying(false); return; }
    setResult(data);
    setApplying(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-0)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spin" style={{ width: 24, height: 24 }} />
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-0)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Job not found</div>
        <p style={{ fontSize: 13, color: "var(--text-2)" }}>This link may have expired or been removed.</p>
        <Link href="/" className="btn btn-secondary btn-sm">Go home</Link>
      </div>
    );
  }

  const ai = project.aiAnalysis ? (() => { try { return JSON.parse(project.aiAnalysis); } catch { return null; } })() : null;
  const reqSkills: string[] = (() => { try { return JSON.parse(project.requiredSkills || "[]"); } catch { return []; } })();

  // Success screen
  if (result?.success) {
    const ar = result.aiResult as Record<string, unknown> | undefined;
    const score = (ar?.score as number) ?? 0;
    const category = String(ar?.category ?? "");
    const reasoning = ar?.reasoning ? String(ar.reasoning) : "";
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-0)", display: "flex", flexDirection: "column" }}>
        <header style={{ height: 52, borderBottom: "1px solid var(--border-0)", display: "flex", alignItems: "center", padding: "0 28px" }}>
          <Link href="/" className="nav-logo">
            <span className="logo-icon"><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
            PlaceAI
          </Link>
        </header>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ maxWidth: 480, width: "100%" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--green)", marginBottom: 8 }}>Application submitted</div>
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>{project.title}</h1>
              <p style={{ fontSize: 13, color: "var(--text-2)" }}>{project.companyName}</p>
            </div>

            {ar && (
              <div className="card card-p" style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 24, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid var(--border-0)" }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 6 }}>AI Score</div>
                    <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1, color: score >= 80 ? "var(--green)" : score >= 50 ? "var(--amber)" : "var(--red)" }}>
                      {score}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 6 }}>Category</div>
                    <span className={`badge ${category === "highly_recommended" ? "badge-green" : category === "minimum_met" ? "badge-amber" : "badge-red"}`}>
                      {category === "highly_recommended" ? "Top pick" : category === "minimum_met" ? "Minimum met" : "Not qualified"}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 6 }}>Skill match</div>
                    <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>{Number(ar?.skillMatch ?? 0)}%</div>
                  </div>
                </div>
                {reasoning && (
                  <p style={{ fontSize: 12, color: "var(--text-2)", fontStyle: "italic", lineHeight: 1.7 }}>AI · {reasoning}</p>
                )}
              </div>
            )}

            <Link href="/student/dashboard" className="btn btn-primary w-full" style={{ justifyContent: "center" }}>
              Track applications
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in screen
  if (notLoggedIn) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-0)", display: "flex", flexDirection: "column" }}>
        <header style={{ height: 52, borderBottom: "1px solid var(--border-0)", display: "flex", alignItems: "center", padding: "0 28px" }}>
          <Link href="/" className="nav-logo">
            <span className="logo-icon"><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
            PlaceAI
          </Link>
        </header>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ maxWidth: 380, width: "100%", textAlign: "center" }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Sign in to apply</h2>
            <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 24 }}>You need a student account to apply for this position.</p>
            <div className="flex gap-3 justify-center">
              <Link href={`/sign-in`} className="btn btn-primary">Sign in</Link>
              <Link href={`/sign-up?role=student`} className="btn btn-secondary">Create account</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-0)", display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <header style={{ height: 52, borderBottom: "1px solid var(--border-0)", display: "flex", alignItems: "center", padding: "0 28px", justifyContent: "space-between", flexShrink: 0, position: "sticky", top: 0, background: "rgba(6,9,18,0.92)", backdropFilter: "blur(12px)", zIndex: 50 }}>
        <Link href="/" className="nav-logo">
          <span className="logo-icon"><svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
          PlaceAI
        </Link>
        <div className="flex gap-2">
          <Link href="/sign-in" className="btn btn-ghost btn-sm">Sign in</Link>
          <Link href="/sign-up" className="btn btn-primary btn-sm">Sign up free</Link>
        </div>
      </header>

      <div style={{ flex: 1, padding: "40px 24px 64px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          {/* Job header */}
          <div className="card card-p" style={{ marginBottom: 16, padding: "24px 28px" }}>
            <div className="flex items-start gap-4">
              <div style={{ width: 44, height: 44, borderRadius: "var(--radius-6)", background: "var(--bg-3)", border: "1px solid var(--border-1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 800, fontSize: 16, color: "var(--text-1)" }}>
                {project.companyName.slice(0, 1).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-2" style={{ marginBottom: 6, flexWrap: "wrap" }}>
                  <span className={`badge ${project.type === "internship" ? "badge-blue" : "badge-purple"}`}>{project.type}</span>
                  {project.deadline && <span className="badge badge-amber">Deadline {new Date(project.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
                </div>
                <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 6 }}>{project.title}</h1>
                <div className="flex gap-3" style={{ fontSize: 13, color: "var(--text-2)", flexWrap: "wrap" }}>
                  <span>{project.companyName}</span>
                  {project.location && <span>· {project.location}</span>}
                  <span>· {project.openings} opening{project.openings !== 1 ? "s" : ""}</span>
                  {project.salaryMin && (
                    <span>· {project.type === "internship" ? "Stipend" : "CTC"}: ₹{project.salaryMin.toLocaleString()}{project.salaryMax ? `–${project.salaryMax.toLocaleString()}` : ""}{project.type === "internship" ? "/mo" : " LPA"}</span>
                  )}
                  {project.duration && <span>· {project.duration}</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ gap: 16, marginBottom: 16 }}>
            {/* About */}
            <div>
              <div className="card card-p" style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 10 }}>About the role</div>
                <p style={{ fontSize: 13, color: "var(--text-1)", lineHeight: 1.8 }}>{project.description}</p>
              </div>
              {project.minimumRequirements && (
                <div className="card card-p">
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 10 }}>Requirements</div>
                  <p style={{ fontSize: 13, color: "var(--text-1)", lineHeight: 1.8 }}>{project.minimumRequirements}</p>
                </div>
              )}
            </div>

            {/* Skills + AI */}
            <div>
              {reqSkills.length > 0 && (
                <div className="card card-p" style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 10 }}>Required skills</div>
                  <div className="flex" style={{ flexWrap: "wrap", gap: 5 }}>
                    {reqSkills.map((s) => <span key={s} className="tag">{s}</span>)}
                  </div>
                </div>
              )}
              {ai?.idealCandidateProfile && (
                <div className="card card-p">
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 10 }}>Ideal candidate</div>
                  <p style={{ fontSize: 13, color: "var(--text-1)", lineHeight: 1.8 }}>{ai.idealCandidateProfile}</p>
                </div>
              )}
            </div>
          </div>

          {/* Apply section */}
          <div className="card card-p" style={{ padding: "24px 28px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 14 }}>Apply for this position</div>
            <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 16, lineHeight: 1.6 }}>
              Your profile will be analyzed by AI against this job&apos;s requirements. Make sure your <Link href="/student/profile" style={{ color: "var(--blue)", textDecoration: "none" }}>profile</Link> is up to date.
            </p>
            <div className="field" style={{ marginBottom: 14 }}>
              <label className="label">Cover letter (optional)</label>
              <textarea className="input textarea" placeholder="Tell us why you're a strong fit for this role..." value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} />
            </div>
            {result?.error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{result.error}</div>}
            <button className="btn btn-primary w-full" style={{ height: 42, justifyContent: "center" }} onClick={handleApply} disabled={applying}>
              {applying ? <><div className="spin" />AI is analyzing your profile...</> : "Submit application — AI will score instantly"}
            </button>
            <p style={{ fontSize: 11, color: "var(--text-3)", textAlign: "center", marginTop: 10 }}>
              No account?{" "}
              <Link href="/sign-up?role=student" style={{ color: "var(--blue)", textDecoration: "none" }}>Sign up free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
