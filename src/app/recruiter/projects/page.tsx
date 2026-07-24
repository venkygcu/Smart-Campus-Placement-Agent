"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Project {
  id: string; title: string; type: string; slug: string; status: string;
  companyName: string; location: string; openings: number; createdAt: string;
}

export default function RecruiterProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects").then((r) => r.json()).then((d) => setProjects(d.projects || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center" style={{ height: 300 }}><div className="spin" style={{ width: 24, height: 24 }} /></div>;

  return (
    <div>
      <div className="page-head">
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 4 }}>Recruiter portal</div>
          <h1 className="page-title">Projects</h1>
          <p className="page-desc">{projects.length} project{projects.length !== 1 ? "s" : ""} total</p>
        </div>
        <Link href="/recruiter/projects/new" className="btn btn-primary btn-sm">New project</Link>
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
                <th>Company</th>
                <th>Type</th>
                <th>Status</th>
                <th>Openings</th>
                <th>Location</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td style={{ color: "var(--text-0)", fontWeight: 500 }}>{p.title}</td>
                  <td style={{ fontSize: 12 }}>{p.companyName}</td>
                  <td><span className={`badge ${p.type === "internship" ? "badge-blue" : "badge-purple"}`}>{p.type}</span></td>
                  <td><span className={`badge ${p.status === "active" ? "badge-green" : "badge-neutral"}`}>{p.status}</span></td>
                  <td>{p.openings}</td>
                  <td style={{ fontSize: 12, color: "var(--text-2)" }}>{p.location || "—"}</td>
                  <td style={{ fontSize: 12 }}>{new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td><Link href={`/recruiter/projects/${p.slug}`} className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
