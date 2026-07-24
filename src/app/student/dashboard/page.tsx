"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Application {
  application: { id: string; status: string; aiScore: number; aiCategory: string; skillMatch: number; appliedAt: string; };
  project: { title: string; companyName: string; type: string; slug: string; };
}

interface StudentProfile {
  fullName: string; college: string; cgpa: number; skills: string;
  degree: string; branch: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/student/profile").then((r) => r.json()),
      fetch("/api/student/applications").then((r) => r.json()),
    ]).then(([p, a]) => {
      setProfile(p.profile);
      setApplications(a.applications || []);
    }).finally(() => setLoading(false));
  }, []);

  const skills: string[] = (() => { try { return JSON.parse(profile?.skills || "[]"); } catch { return []; } })();

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
        <div className="spin" style={{ width: 24, height: 24 }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-head">
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 4 }}>Dashboard</div>
          <h1 className="page-title">{profile?.fullName || "Welcome back"}</h1>
          <p className="page-desc">{profile?.degree} {profile?.branch ? `· ${profile.branch}` : ""} {profile?.college ? `· ${profile.college}` : ""}</p>
        </div>
        <Link href="/student/profile" className="btn btn-secondary btn-sm">Edit profile</Link>
      </div>

      <div className="grid-2" style={{ gap: 16, marginBottom: 24 }}>
        {/* Skills */}
        <div className="card card-p">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Skills</div>
            <Link href="/student/profile" className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>Manage</Link>
          </div>
          {skills.length > 0 ? (
            <div className="flex" style={{ flexWrap: "wrap", gap: 6 }}>
              {skills.map((s) => <span key={s} className="tag">{s}</span>)}
            </div>
          ) : (
            <p style={{ fontSize: 12, color: "var(--text-3)" }}>No skills added. <Link href="/student/profile" style={{ color: "var(--blue)", textDecoration: "none" }}>Add skills →</Link></p>
          )}
        </div>

        {/* Quick apply */}
        <div className="card card-p">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Apply with link</div>
          <p style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 12, lineHeight: 1.6 }}>
            Got a job posting link from a company? Enter the slug below to go to the application page.
          </p>
          <div className="flex gap-2">
            <input
              className="input"
              style={{ flex: 1, fontSize: 12 }}
              placeholder="company-name-XXXXX"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && slug.trim() && router.push(`/apply/${slug.trim()}`)}
            />
            <button className="btn btn-primary btn-sm" onClick={() => slug.trim() && router.push(`/apply/${slug.trim()}`)}>
              Go
            </button>
          </div>
        </div>
      </div>

      {/* Recent applications */}
      <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>My applications</div>
        <Link href="/student/applications" className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>View all</Link>
      </div>

      {applications.length === 0 ? (
        <div className="card card-p" style={{ textAlign: "center", padding: "40px 24px" }}>
          <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 12 }}>No applications yet.</p>
          <p style={{ fontSize: 12, color: "var(--text-3)" }}>Enter a company link above to find and apply for your first role.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Role</th>
                <th>Company</th>
                <th>Type</th>
                <th>AI Score</th>
                <th>Category</th>
                <th>Status</th>
                <th>Applied</th>
              </tr>
            </thead>
            <tbody>
              {applications.slice(0, 8).map(({ application: a, project: p }) => (
                <tr key={a.id} style={{ cursor: "pointer" }} onClick={() => router.push(`/apply/${p.slug}`)}>
                  <td style={{ color: "var(--text-0)", fontWeight: 500 }}>{p.title || "—"}</td>
                  <td>{p.companyName || "—"}</td>
                  <td><span className={`badge ${p.type === "internship" ? "badge-blue" : "badge-purple"}`}>{p.type}</span></td>
                  <td>
                    <span style={{ fontWeight: 700, color: (a.aiScore || 0) >= 80 ? "var(--green)" : (a.aiScore || 0) >= 50 ? "var(--amber)" : "var(--red)" }}>
                      {a.aiScore?.toFixed(0) ?? "—"}
                    </span>
                  </td>
                  <td>
                    {a.aiCategory === "highly_recommended" && <span className="badge badge-green">Top pick</span>}
                    {a.aiCategory === "minimum_met" && <span className="badge badge-amber">Min. met</span>}
                    {a.aiCategory === "not_qualified" && <span className="badge badge-red">Not qualified</span>}
                    {!a.aiCategory && <span className="badge badge-neutral">Pending</span>}
                  </td>
                  <td><span className={`badge ${a.status === "shortlisted" ? "badge-green" : a.status === "rejected" ? "badge-red" : "badge-neutral"}`}>{a.status}</span></td>
                  <td style={{ fontSize: 12 }}>{new Date(a.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
