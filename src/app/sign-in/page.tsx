"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Sign in failed"); setLoading(false); return; }
      router.push(data.role === "student" ? "/student/dashboard" : "/recruiter/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-0)", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <header style={{ height: 52, borderBottom: "1px solid var(--border-0)", display: "flex", alignItems: "center", padding: "0 28px", justifyContent: "space-between", flexShrink: 0 }}>
        <Link href="/" className="nav-logo">
          <span className="logo-icon">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M2 7l3.5 3.5L12 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          PlaceAI
        </Link>
        <span style={{ fontSize: 13, color: "var(--text-2)" }}>
          No account?{" "}
          <Link href="/sign-up" style={{ color: "var(--blue)", textDecoration: "none", fontWeight: 600 }}>Sign up</Link>
        </span>
      </header>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          {/* Heading */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 6 }}>Sign in</h1>
            <p style={{ fontSize: 13, color: "var(--text-2)" }}>Enter your credentials to access your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="field">
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>

            <div className="field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="label">Password</label>
              </div>
              <input
                type="password"
                className="input"
                placeholder="Your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
              />
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button type="submit" className="btn btn-primary" style={{ height: 40, width: "100%", marginTop: 4 }} disabled={loading}>
              {loading ? <><div className="spin" />Signing in...</> : "Sign in"}
            </button>
          </form>

          <div style={{ marginTop: 24 }}>
            <div className="rule-label" style={{ marginBottom: 16, color: "var(--text-3)" }}>
              <span>Or continue as</span>
            </div>
            <div className="grid-2" style={{ gap: 8 }}>
              <Link href="/sign-up?role=student" className="btn btn-secondary" style={{ height: 38, fontSize: 13 }}>Student</Link>
              <Link href="/sign-up?role=recruiter" className="btn btn-secondary" style={{ height: 38, fontSize: 13 }}>Recruiter</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
