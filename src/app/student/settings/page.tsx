"use client";
export default function StudentSettings() {
  return (
    <div>
      <div className="page-head">
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 4 }}>Student portal</div>
          <h1 className="page-title">Settings</h1>
          <p className="page-desc">Manage your account preferences.</p>
        </div>
      </div>
      <div className="card card-p" style={{ maxWidth: 480 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 14 }}>Notifications</div>
        {["Application status updates", "AI score received", "Recruiter views profile", "New matching jobs"].map((label) => (
          <div key={label} className="flex items-center justify-between" style={{ paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid var(--border-0)" }}>
            <div style={{ fontSize: 13 }}>{label}</div>
            <label style={{ cursor: "pointer", position: "relative", display: "inline-block", width: 36, height: 20 }}>
              <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={{ position: "absolute", inset: 0, background: "var(--blue)", borderRadius: 99, transition: "var(--t)" }} />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
