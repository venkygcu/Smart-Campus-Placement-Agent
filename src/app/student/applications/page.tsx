"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Application {
  application: { id: string; status: string; aiScore: number; aiCategory: string; aiReasoning: string; skillMatch: number; appliedAt: string; };
  project: { title: string; companyName: string; type: string; slug: string; location: string; };
}

type Filter = "all" | "highly_recommended" | "minimum_met" | "not_qualified";

export default function ApplicationsPage() {
  const router = useRouter();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    fetch("/api/student/applications").then((r) => r.json()).then((d) => setApps(d.applications || [])).finally(() => setLoading(false));
  }, []);

  const counts = {
    all: apps.length,
    highly_recommended: apps.filter((a) => a.application.aiCategory === "highly_recommended").length,
    minimum_met: apps.filter((a) => a.application.aiCategory === "minimum_met").length,
    not_qualified: apps.filter((a) => a.application.aiCategory === "not_qualified").length,
  };

  const filtered = filter === "all" ? apps : apps.filter((a) => a.application.aiCategory === filter);

  if (loading) {
    return <div className="flex items-center justify-center" style={{ height: 300 }}><div className="spin" style={{ width: 24, height: 24 }} /></div>;
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 4 }}>Student portal</div>
          <h1 className="page-title">Applications</h1>
          <p className="page-desc">{apps.length} total · AI-scored and categorized</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2" style={{ marginBottom: 20, flexWrap: "wrap" }}>
        {([
          { key: "all", label: "All" },
          { key: "highly_recommended", label: "Top picks" },
          { key: "minimum_met", label: "Minimum met" },
          { key: "not_qualified", label: "Not qualified" },
        ] as { key: Filter; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`btn btn-sm ${filter === key ? "btn-primary" : "btn-ghost"}`}
            style={{ gap: 6 }}
          >
            {label}
            <span style={{ fontSize: 11, opacity: 0.8 }}>({counts[key]})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card card-p" style={{ textAlign: "center", padding: "40px 24px" }}>
          <p style={{ fontSize: 13, color: "var(--text-2)" }}>No applications in this category.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(({ application: a, project: p }) => (
            <div
              key={a.id}
              className="card card-hover"
              style={{ padding: "16px 20px", cursor: "pointer" }}
              onClick={() => router.push(`/apply/${p.slug}`)}
            >
              <div className="flex items-center justify-between" style={{ flexWrap: "wrap", gap: 12 }}>
                <div className="flex items-start gap-4">
                  <div style={{ paddingTop: 2 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-0)", marginBottom: 4 }}>
                      {p.title}
                      <span style={{ fontSize: 12, fontWeight: 400, color: "var(--text-2)", marginLeft: 8 }}>@ {p.companyName}</span>
                    </div>
                    <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
                      <span className={`badge ${p.type === "internship" ? "badge-blue" : "badge-purple"}`}>{p.type}</span>
                      {p.location && <span style={{ fontSize: 11, color: "var(--text-3)" }}>{p.location}</span>}
                      {a.aiCategory === "highly_recommended" && <span className="badge badge-green">Top pick</span>}
                      {a.aiCategory === "minimum_met" && <span className="badge badge-amber">Min. met</span>}
                      {a.aiCategory === "not_qualified" && <span className="badge badge-red">Not qualified</span>}
                      <span className={`badge ${a.status === "shortlisted" ? "badge-green" : a.status === "rejected" ? "badge-red" : "badge-neutral"}`}>{a.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6" style={{ flexShrink: 0 }}>
                  {a.aiScore != null && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.04em", color: (a.aiScore || 0) >= 80 ? "var(--green)" : (a.aiScore || 0) >= 50 ? "var(--amber)" : "var(--red)", lineHeight: 1 }}>{a.aiScore.toFixed(0)}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-3)", marginTop: 2 }}>AI score</div>
                    </div>
                  )}
                  {a.skillMatch != null && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>{a.skillMatch.toFixed(0)}%</div>
                      <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-3)", marginTop: 2 }}>skill match</div>
                    </div>
                  )}
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, color: "var(--text-2)" }}>{new Date(a.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                  </div>
                </div>
              </div>

              {a.aiReasoning && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border-0)", fontSize: 12, color: "var(--text-2)", fontStyle: "italic", lineHeight: 1.6 }}>
                  AI · {a.aiReasoning}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
