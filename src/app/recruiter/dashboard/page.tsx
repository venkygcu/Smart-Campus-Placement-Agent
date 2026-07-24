"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Project {
  id: string; title: string; type: string; slug: string;
  status: string; openings: number; createdAt: string; companyName: string;
}

export default function RecruiterDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [profile, setProfile] = useState<{ fullName: string; companyName: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/projects").then((r) => r.json()),
    ]).then(([me, p]) => {
      setProfile(me.profile);
      setProjects(p.projects || []);
    }).finally(() => setLoading(false));
  }, []);

  const copy = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/apply/${slug}`);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  };

  const stats = [
    { label: "Total projects", value: projects.length },
    { label: "Active drives", value: projects.filter((p) => p.status === "active").length, color: "var(--green)" },
    { label: "Closed", value: projects.filter((p) => p.status === "closed").length, color: "var(--text-2)" },
    { label: "Total openings", value: projects.reduce((s, p) => s + (p.openings || 0), 0), color: "var(--blue)" },
  ];

  if (loading) return <div className="flex items-center justify-center" style={{ height: 300 }}><div className="spin" style={{ width: 24, height: 24 }} /></div>;

  return (
    <div>
      <div className="page-head">
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 4 }}>Recruiter portal</div>
          <h1 className="page-title">{profile?.companyName || "Dashboard"}</h1>
          <p className="page-desc">{profile?.fullName} · Placement recruitment</p>
        </div>
        <Link href="/recruiter/projects/new" className="btn btn-primary btn-sm">New project</Link>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ gap: 12, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-value" style={{ color: s.color || "var(--text-0)" }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Projects */}
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Projects</div>
        <Link href="/recruiter/projects/new" className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>+ New</Link>
      </div>

      {projects.length === 0 ? (
        <div className="card card-p" style={{ textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>No projects yet</div>
          <p style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 20 }}>Create your first placement drive and start recruiting.</p>
          <Link href="/recruiter/projects/new" className="btn btn-primary btn-sm">Create project</Link>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Openings</th>
                <th>Application link</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td style={{ color: "var(--text-0)", fontWeight: 500 }}>{p.title}</td>
                  <td><span className={`badge ${p.type === "internship" ? "badge-blue" : "badge-purple"}`}>{p.type}</span></td>
                  <td><span className={`badge ${p.status === "active" ? "badge-green" : "badge-neutral"}`}>{p.status}</span></td>
                  <td>{p.openings}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <code style={{ fontSize: 11 }}>{p.slug}</code>
                      <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: "0 8px", height: 22 }} onClick={() => copy(p.slug)}>
                        {copied === p.slug ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </td>
                  <td style={{ fontSize: 12 }}>{new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => router.push(`/recruiter/projects/${p.slug}`)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
