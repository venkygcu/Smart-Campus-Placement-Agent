"use client";
export default function RecruiterSettings() {
  return (
    <div>
      <div className="page-head">
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 4 }}>Recruiter portal</div>
          <h1 className="page-title">Settings</h1>
          <p className="page-desc">Manage your account and notification preferences.</p>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 500 }}>
        <div className="card card-p">
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 14 }}>Notifications</div>
          {["New application received", "AI scoring complete", "Candidate accepted offer"].map((label) => (
            <div key={label} className="flex items-center justify-between" style={{ paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid var(--border-0)" }}>
              <div style={{ fontSize: 13 }}>{label}</div>
              <label style={{ cursor: "pointer", position: "relative", display: "inline-block", width: 36, height: 20 }}>
                <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: "absolute", inset: 0, background: "var(--blue)", borderRadius: 99 }} />
              </label>
            </div>
          ))}
        </div>
        <div className="card card-p">
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginBottom: 14 }}>Danger zone</div>
          <p style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 12 }}>These actions are irreversible. Proceed with caution.</p>
          <button className="btn btn-ghost btn-sm" style={{ color: "var(--red)", borderColor: "rgba(239,68,68,0.2)" }} onClick={() => confirm("This will delete your account and all projects. Are you sure?") && null}>
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
}
