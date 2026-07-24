"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Student {
  id: string; fullName: string; email: string; phone: string;
  college: string; degree: string; branch: string; cgpa: number;
  skills: string; graduationYear: number;
  linkedinUrl: string; githubUrl: string; portfolioUrl: string;
  bio: string; achievements: string; location: string;
  experience: string; projects: string; resumeText: string;
}
interface Application {
  id: string; status: string; aiScore: number; aiCategory: string;
  aiReasoning: string; skillMatch: number; coverLetter: string;
  appliedAt: string; updatedAt: string;
}
interface AppRow { application: Application; student: Student; }
interface Categorized {
  highly_recommended: AppRow[];
  minimum_met: AppRow[];
  not_qualified: AppRow[];
  applied: AppRow[];
}
interface Project {
  id: string; title: string; type: string; slug: string; status: string;
  companyName: string; description: string; location: string;
  salaryMin: number; salaryMax: number; openings: number;
}

type Tab = keyof Categorized;

const TABS: { key: Tab; label: string; color: string }[] = [
  { key: "highly_recommended", label: "Top picks", color: "var(--green)" },
  { key: "minimum_met", label: "Minimum met", color: "var(--amber)" },
  { key: "not_qualified", label: "Not qualified", color: "var(--red)" },
  { key: "applied", label: "Pending", color: "var(--text-3)" },
];

const STATUS_OPTIONS = ["applied", "shortlisted", "rejected", "hired"];

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [categorized, setCategorized] = useState<Categorized | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("highly_recommended");
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${slug}/applications`)
      .then((r) => r.json())
      .then((d) => { setProject(d.project); setCategorized(d.categorized); })
      .finally(() => setLoading(false));
  }, [slug]);

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/apply/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateStatus = async (appId: string, status: string) => {
    setStatusUpdating(appId);
    await fetch(`/api/applications/${appId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    // Re-fetch
    const d = await fetch(`/api/projects/${slug}/applications`).then((r) => r.json());
    setCategorized(d.categorized);
    setStatusUpdating(null);
  };

  if (loading) return <div className="flex items-center justify-center" style={{ height: 300 }}><div className="spin" style={{ width: 24, height: 24 }} /></div>;
  if (!project) return <div style={{ textAlign: "center", padding: 60, color: "var(--text-2)" }}>Project not found.</div>;

  const rows = categorized?.[tab] || [];
  const totalApps = Object.values(categorized || {}).flat().length;

  return (
    <div>
      {/* Header */}
      <div className="page-head">
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 4 }}>Project</div>
          <h1 className="page-title">{project.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`badge ${project.type === "internship" ? "badge-blue" : "badge-purple"}`}>{project.type}</span>
            <span className={`badge ${project.status === "active" ? "badge-green" : "badge-neutral"}`}>{project.status}</span>
            <span style={{ fontSize: 12, color: "var(--text-2)" }}>{project.companyName}</span>
            {project.location && <span style={{ fontSize: 12, color: "var(--text-3)" }}>· {project.location}</span>}
            <span style={{ fontSize: 12, color: "var(--text-3)" }}>· {project.openings} opening{project.openings !== 1 ? "s" : ""}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm" onClick={copyLink}>{copied ? "Copied!" : "Copy apply link"}</button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid-4" style={{ gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total applicants", value: totalApps },
          { label: "Top picks", value: categorized?.highly_recommended.length || 0, color: "var(--green)" },
          { label: "Minimum met", value: categorized?.minimum_met.length || 0, color: "var(--amber)" },
          { label: "Not qualified", value: categorized?.not_qualified.length || 0, color: "var(--red)" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-value" style={{ fontSize: 22, color: s.color || "var(--text-0)" }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-2" style={{ marginBottom: 16, flexWrap: "wrap" }}>
        {TABS.map((t) => {
          const count = categorized?.[t.key]?.length || 0;
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => { setTab(t.key); setExpanded(null); }}
              className={`btn btn-sm ${active ? "btn-primary" : "btn-ghost"}`} style={{ gap: 6 }}>
              {t.label}
              <span style={{ fontSize: 11, opacity: 0.8 }}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Candidates */}
      {rows.length === 0 ? (
        <div className="card card-p" style={{ textAlign: "center", padding: "40px 24px", color: "var(--text-3)" }}>
          No candidates in this category yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map(({ application: a, student: s }) => {
            const skills: string[] = (() => { try { return JSON.parse(s.skills || "[]"); } catch { return []; } })();
            const experience: {role:string;company:string;duration:string;description:string}[] = (() => { try { return JSON.parse(s.experience || "[]"); } catch { return []; } })();
            const projectsList: {name:string;description:string;technologies:string[]}[] = (() => { try { return JSON.parse(s.projects || "[]"); } catch { return []; } })();
            const isOpen = expanded === a.id;
            const scoreColor = (a.aiScore || 0) >= 80 ? "var(--green)" : (a.aiScore || 0) >= 50 ? "var(--amber)" : "var(--red)";

            return (
              <div key={a.id} className="card" style={{ overflow: "hidden", transition: "var(--t)" }}>
                {/* Collapsed row — always visible */}
                <div
                  style={{ padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 16 }}
                  onClick={() => setExpanded(isOpen ? null : a.id)}
                >
                  {/* AI score ring */}
                  <div style={{
                    flexShrink: 0, width: 48, height: 48, borderRadius: "50%",
                    border: `3px solid ${scoreColor}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexDirection: "column",
                  }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{a.aiScore?.toFixed(0) ?? "—"}</span>
                  </div>

                  {/* Name + email + college */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-0)" }}>{s.fullName}</div>
                    <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 1 }}>{s.email}{s.phone ? ` · ${s.phone}` : ""}</div>
                    <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 1 }}>
                      {s.college} {s.degree ? `· ${s.degree}` : ""}{s.branch ? ` ${s.branch}` : ""} {s.graduationYear ? `· ${s.graduationYear}` : ""}
                    </div>
                  </div>

                  {/* CGPA */}
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: (s.cgpa || 0) >= 8 ? "var(--green)" : "var(--text-1)" }}>{s.cgpa || "—"}</div>
                    <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 1 }}>CGPA</div>
                  </div>

                  {/* Skill match */}
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-0)" }}>{a.skillMatch?.toFixed(0) ?? "—"}%</div>
                    <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 1 }}>Skill match</div>
                  </div>

                  {/* Category badge */}
                  <div style={{ flexShrink: 0 }}>
                    {a.aiCategory === "highly_recommended" && <span className="badge badge-green">Top pick</span>}
                    {a.aiCategory === "minimum_met" && <span className="badge badge-amber">Min. met</span>}
                    {a.aiCategory === "not_qualified" && <span className="badge badge-red">Not qualified</span>}
                    {!a.aiCategory && <span className="badge badge-neutral">Pending</span>}
                  </div>

                  {/* Status badge */}
                  <span className={`badge ${a.status === "shortlisted" ? "badge-green" : a.status === "rejected" ? "badge-red" : a.status === "hired" ? "badge-purple" : "badge-neutral"}`}>
                    {a.status}
                  </span>

                  {/* Chevron */}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", color: "var(--text-3)" }}>
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Expanded detail panel */}
                {isOpen && (
                  <div style={{ borderTop: "1px solid var(--border-0)", padding: "20px 18px", display: "flex", flexDirection: "column", gap: 20 }}>

                    {/* ── Row 1: AI Review + Actions ── */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 8 }}>AI Assessment</div>
                        <p style={{ fontSize: 13, color: "var(--text-1)", lineHeight: 1.7 }}>{a.aiReasoning || "No reasoning available."}</p>
                      </div>

                      {/* Status update + links */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 160 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 2 }}>Update status</div>
                        <select
                          defaultValue={a.status}
                          disabled={statusUpdating === a.id}
                          onChange={(e) => updateStatus(a.id, e.target.value)}
                          style={{
                            background: "var(--bg-2)", border: "1px solid var(--border-1)", color: "var(--text-0)",
                            borderRadius: "var(--radius-4)", padding: "6px 10px", fontSize: 12, cursor: "pointer", width: "100%",
                          }}
                        >
                          {STATUS_OPTIONS.map((st) => <option key={st} value={st}>{st.charAt(0).toUpperCase() + st.slice(1)}</option>)}
                        </select>

                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 2, marginTop: 4 }}>Contact</div>
                        <a href={`mailto:${s.email}`} style={{ fontSize: 12, color: "var(--blue)", textDecoration: "none", wordBreak: "break-all" }}>{s.email}</a>
                        {s.phone && <span style={{ fontSize: 12, color: "var(--text-2)" }}>{s.phone}</span>}
                        {s.location && <span style={{ fontSize: 12, color: "var(--text-3)" }}>{s.location}</span>}

                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                          {s.linkedinUrl && (
                            <a href={s.linkedinUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ fontSize: 11 }}>LinkedIn</a>
                          )}
                          {s.githubUrl && (
                            <a href={s.githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ fontSize: 11 }}>GitHub</a>
                          )}
                          {s.portfolioUrl && (
                            <a href={s.portfolioUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ fontSize: 11 }}>Portfolio</a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ── Row 2: Skills ── */}
                    {skills.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 8 }}>Skills</div>
                        <div className="flex" style={{ flexWrap: "wrap", gap: 5 }}>
                          {skills.map((sk) => <span key={sk} className="tag">{sk}</span>)}
                        </div>
                      </div>
                    )}

                    {/* ── Row 3: Bio + Achievements ── */}
                    {(s.bio || s.achievements) && (
                      <div style={{ display: "grid", gridTemplateColumns: s.bio && s.achievements ? "1fr 1fr" : "1fr", gap: 16 }}>
                        {s.bio && (
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 6 }}>Bio</div>
                            <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.7 }}>{s.bio}</p>
                          </div>
                        )}
                        {s.achievements && (
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 6 }}>Achievements</div>
                            <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.7 }}>{s.achievements}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── Row 4: Experience ── */}
                    {experience.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 8 }}>Experience</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {experience.map((exp, i) => (
                            <div key={i} style={{ padding: "10px 14px", background: "var(--bg-1)", borderRadius: "var(--radius-4)", borderLeft: "2px solid var(--blue-border)" }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-0)" }}>{exp.role} <span style={{ color: "var(--text-3)", fontWeight: 400 }}>at {exp.company}</span></div>
                              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{exp.duration}</div>
                              {exp.description && <p style={{ fontSize: 12, color: "var(--text-2)", marginTop: 5, lineHeight: 1.6 }}>{exp.description}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Row 5: Projects ── */}
                    {projectsList.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 8 }}>Projects</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
                          {projectsList.map((proj, i) => (
                            <div key={i} style={{ padding: "12px 14px", background: "var(--bg-1)", borderRadius: "var(--radius-4)", border: "1px solid var(--border-0)" }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-0)", marginBottom: 4 }}>{proj.name}</div>
                              {proj.description && <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 6 }}>{proj.description}</p>}
                              {(proj.technologies || []).length > 0 && (
                                <div className="flex" style={{ flexWrap: "wrap", gap: 4 }}>
                                  {proj.technologies.map((t) => <span key={t} className="tag" style={{ fontSize: 10 }}>{t}</span>)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Row 6: Cover letter ── */}
                    {a.coverLetter && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 6 }}>Cover Letter</div>
                        <p style={{ fontSize: 13, color: "var(--text-1)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{a.coverLetter}</p>
                      </div>
                    )}

                    {/* ── Row 7: Resume text ── */}
                    {s.resumeText && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 6 }}>Resume (extracted text)</div>
                        <pre style={{
                          fontSize: 11, lineHeight: 1.7, color: "var(--text-2)",
                          background: "var(--bg-0)", padding: "14px 16px", borderRadius: "var(--radius-4)",
                          border: "1px solid var(--border-0)", maxHeight: 280, overflowY: "auto",
                          whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "var(--font-mono)",
                        }}>
                          {s.resumeText}
                        </pre>
                      </div>
                    )}

                    {/* Applied date */}
                    <div style={{ fontSize: 11, color: "var(--text-3)", textAlign: "right" }}>
                      Applied {new Date(a.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
