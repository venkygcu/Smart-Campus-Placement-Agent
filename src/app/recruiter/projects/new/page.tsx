"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type ProjectType = "internship" | "placement";

interface Form {
  title: string; description: string; type: ProjectType; location: string;
  minRequirements: string; preferredRequirements: string;
  salaryMin: string; salaryMax: string; duration: string; openings: string; deadline: string;
}

const BLANK: Form = {
  title: "", description: "", type: "internship", location: "",
  minRequirements: "", preferredRequirements: "",
  salaryMin: "", salaryMax: "", duration: "", openings: "1", deadline: "",
};

export default function NewProjectPage() {
  const router = useRouter();
  const [form, setForm] = useState<Form>(BLANK);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ slug: string; aiAnalysis: Record<string, unknown> } | null>(null);

  const up = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          salaryMin: form.salaryMin ? parseFloat(form.salaryMin) : null,
          salaryMax: form.salaryMax ? parseFloat(form.salaryMax) : null,
          openings: parseInt(form.openings) || 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create"); setLoading(false); return; }
      setResult(data);
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  if (result) {
    const ai = result.aiAnalysis as Record<string, unknown>;
    const skills = (ai?.requiredSkills as string[]) || [];
    const summary = ai?.summary ? String(ai.summary) : "";
    return (
      <div style={{ maxWidth: 600 }}>
        <div className="page-head">
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 4 }}>Success</div>
            <h1 className="page-title">Project created</h1>
            <p className="page-desc">AI has analyzed your job posting. Share the link with candidates.</p>
          </div>
        </div>

        <div className="card card-p" style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 10 }}>Application link</div>
          <div className="flex items-center gap-3" style={{ background: "var(--bg-0)", border: "1px solid var(--border-1)", borderRadius: "var(--radius-4)", padding: "10px 14px" }}>
            <code style={{ flex: 1, fontSize: 13, background: "none", border: "none", padding: 0, color: "var(--blue)" }}>
              {typeof window !== "undefined" ? window.location.origin : ""}/apply/{result.slug}
            </code>
            <button className="btn btn-secondary btn-sm" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/apply/${result.slug}`)}>
              Copy
            </button>
          </div>
        </div>

        {ai && (
          <div className="card card-p" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 10 }}>AI analysis</div>
            {summary && <p style={{ fontSize: 13, color: "var(--text-1)", lineHeight: 1.7, marginBottom: 12 }}>{summary}</p>}
            {skills.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>Extracted required skills</div>
                <div className="flex" style={{ flexWrap: "wrap", gap: 5 }}>
                  {skills.map((s) => <span key={s} className="tag">{s}</span>)}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button className="btn btn-secondary" onClick={() => { setResult(null); setLoading(false); setForm(BLANK); }}>
            Create another
          </button>
          <button className="btn btn-primary" onClick={() => router.push(`/recruiter/projects/${result.slug}`)}>
            View project dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <div className="page-head">
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 4 }}>Recruiter portal</div>
          <h1 className="page-title">New project</h1>
          <p className="page-desc">Describe the role. AI will analyze requirements and rank candidates automatically.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Basic */}
        <div className="card card-p">
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 14 }}>Basic details</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="field">
              <label className="label">Job title *</label>
              <input className="input" placeholder="e.g. Software Engineering Intern" value={form.title} onChange={up("title")} required />
            </div>
            <div className="grid-2" style={{ gap: 12 }}>
              <div className="field">
                <label className="label">Type *</label>
                <select className="input select" value={form.type} onChange={up("type")}>
                  <option value="internship">Internship</option>
                  <option value="placement">Full-time placement</option>
                </select>
              </div>
              <div className="field">
                <label className="label">Location</label>
                <input className="input" placeholder="Bangalore / Remote" value={form.location} onChange={up("location")} />
              </div>
            </div>
            <div className="field">
              <label className="label">Job description *</label>
              <textarea className="input textarea" style={{ minHeight: 110 }} placeholder="Describe the role, team, responsibilities, and what you're looking for..." value={form.description} onChange={up("description")} required />
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="card card-p">
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 14 }}>Requirements</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="field">
              <label className="label">Minimum requirements</label>
              <textarea className="input textarea" placeholder="e.g. Proficiency in Python, 7+ CGPA, 2nd or 3rd year student, DSA knowledge..." value={form.minRequirements} onChange={up("minRequirements")} />
            </div>
            <div className="field">
              <label className="label">Preferred / bonus requirements</label>
              <textarea className="input textarea" placeholder="e.g. ML experience, open source contributions, prior internship..." value={form.preferredRequirements} onChange={up("preferredRequirements")} />
            </div>
          </div>
        </div>

        {/* Compensation */}
        <div className="card card-p">
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 14 }}>Compensation &amp; details</div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="field">
              <label className="label">{form.type === "internship" ? "Stipend min (INR/mo)" : "Salary min (INR/yr)"}</label>
              <input type="number" className="input" placeholder="15000" value={form.salaryMin} onChange={up("salaryMin")} />
            </div>
            <div className="field">
              <label className="label">{form.type === "internship" ? "Stipend max (INR/mo)" : "Salary max (INR/yr)"}</label>
              <input type="number" className="input" placeholder="30000" value={form.salaryMax} onChange={up("salaryMax")} />
            </div>
            {form.type === "internship" && (
              <div className="field">
                <label className="label">Duration</label>
                <input className="input" placeholder="2 months" value={form.duration} onChange={up("duration")} />
              </div>
            )}
            <div className="field">
              <label className="label">Number of openings</label>
              <input type="number" min={1} className="input" value={form.openings} onChange={up("openings")} />
            </div>
            <div className="field">
              <label className="label">Application deadline</label>
              <input type="date" className="input" value={form.deadline} onChange={up("deadline")} />
            </div>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="flex justify-between items-center">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => router.back()}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <><div className="spin" />AI is analyzing...</> : "Create project with AI analysis"}
          </button>
        </div>
      </form>
    </div>
  );
}
