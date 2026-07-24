"use client";
import { useEffect, useState } from "react";
import SkillsInput from "@/components/SkillsInput";

interface Profile {
  fullName: string; email: string; phone: string; college: string;
  degree: string; branch: string; graduationYear: number; cgpa: number;
  skills: string; achievements: string; linkedinUrl: string; githubUrl: string;
  portfolioUrl: string; bio: string; location: string;
}

function InputRow({ label, type = "text", value, onChange, placeholder, wide }: {
  label: string; type?: string; value: string | number; onChange: (v: string) => void;
  placeholder?: string; wide?: boolean;
}) {
  return (
    <div className={`field${wide ? " col-span-2" : ""}`}>
      <label className="label">{label}</label>
      <input type={type} className="input" placeholder={placeholder} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/student/profile").then((r) => r.json()).then((d) => {
      if (d.profile) {
        setProfile(d.profile);
        try { setSkills(JSON.parse(d.profile.skills || "[]")); } catch { setSkills([]); }
      }
    }).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch("/api/student/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...profile, skills }),
    });
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2500);
  };



  const up = (key: keyof Profile) => (v: string) => setProfile((p) => ({ ...p, [key]: v }));

  if (loading) return <div className="flex items-center justify-center" style={{ height: 300 }}><div className="spin" style={{ width: 24, height: 24 }} /></div>;

  return (
    <div>
      <div className="page-head">
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 4 }}>Student portal</div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-desc">Keep your profile accurate for better AI match scores.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
          {saving ? <><div className="spin" />Saving...</> : saved ? "Saved" : "Save changes"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Personal */}
        <div className="card card-p">
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 14 }}>Personal information</div>
          <div className="grid-2" style={{ gap: 12 }}>
            <InputRow label="Full name" value={profile.fullName || ""} onChange={up("fullName")} placeholder="Jane Doe" />
            <InputRow label="Email" type="email" value={profile.email || ""} onChange={up("email")} placeholder="jane@example.com" />
            <InputRow label="Phone" value={profile.phone || ""} onChange={up("phone")} placeholder="+91 98765 43210" />
            <InputRow label="Location" value={profile.location || ""} onChange={up("location")} placeholder="Bangalore, India" />
            <div className="field col-span-2">
              <label className="label">Bio / Summary</label>
              <textarea className="input textarea" placeholder="A short professional summary..." value={profile.bio || ""} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="card card-p">
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 14 }}>Education</div>
          <div className="grid-2" style={{ gap: 12 }}>
            <InputRow label="College / University" value={profile.college || ""} onChange={up("college")} placeholder="IIT Delhi" wide />
            <InputRow label="Degree" value={profile.degree || ""} onChange={up("degree")} placeholder="B.Tech" />
            <InputRow label="Branch / Major" value={profile.branch || ""} onChange={up("branch")} placeholder="Computer Science" />
            <InputRow label="Graduation year" type="number" value={profile.graduationYear || ""} onChange={up("graduationYear")} placeholder="2025" />
            <InputRow label="CGPA" type="number" value={profile.cgpa || ""} onChange={up("cgpa")} placeholder="8.5" />
          </div>
        </div>

        {/* Skills */}
        <div className="card card-p">
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 14 }}>Skills</div>
          <SkillsInput value={skills} onChange={setSkills} />
        </div>

        {/* Links */}
        <div className="card card-p">
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 14 }}>Links &amp; achievements</div>
          <div className="grid-2" style={{ gap: 12 }}>
            <InputRow label="LinkedIn URL" value={profile.linkedinUrl || ""} onChange={up("linkedinUrl")} placeholder="https://linkedin.com/in/..." />
            <InputRow label="GitHub URL" value={profile.githubUrl || ""} onChange={up("githubUrl")} placeholder="https://github.com/..." />
            <InputRow label="Portfolio / Website" value={profile.portfolioUrl || ""} onChange={up("portfolioUrl")} placeholder="https://yoursite.com" wide />
            <div className="field col-span-2">
              <label className="label">Achievements</label>
              <textarea className="input textarea" placeholder="Certifications, hackathon wins, awards..." value={profile.achievements || ""} onChange={(e) => setProfile((p) => ({ ...p, achievements: e.target.value }))} />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? <><div className="spin" />Saving...</> : saved ? "Saved" : "Save all changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
