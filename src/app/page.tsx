"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const STATS = [
  { value: "10,000+", label: "Students placed" },
  { value: "480+", label: "Partner companies" },
  { value: "3.2×", label: "Faster shortlisting" },
  { value: "97%", label: "Match accuracy" },
];

const REVIEWS = [
  {
    quote: "The AI parsed my resume in under 10 seconds and filled everything correctly. I got shortlisted at three companies without any extra effort.",
    name: "Priya Sharma",
    role: "SWE · Google",
    initials: "PS",
    accent: "#3b82f6",
  },
  {
    quote: "As a recruiter, the candidate ranking tables are exactly what I needed. Groq AI's shortlisting reduced my review time by 80%.",
    name: "Rahul Mehta",
    role: "HR Lead · Flipkart",
    initials: "RM",
    accent: "#10b981",
  },
  {
    quote: "Shared the unique link in our college group. Within a week we had 200+ applicants, all ranked and categorized automatically.",
    name: "Ananya Singh",
    role: "PM · Razorpay",
    initials: "AS",
    accent: "#8b5cf6",
  },
  {
    quote: "The project dashboard showed me skill gaps across all candidates at a glance. Haven't used spreadsheets since.",
    name: "Vikram Patel",
    role: "CTO · TechStart",
    initials: "VP",
    accent: "#f59e0b",
  },
];

const FEATURES = [
  { title: "Resume Intelligence", desc: "Upload PDF, image, or text. Groq AI extracts structured data — skills, experience, education — in seconds.", accent: "linear-gradient(135deg,#3b82f6,#06b6d4)" },
  { title: "Instant AI Scoring", desc: "Every applicant is scored 0–100 against job requirements the moment they apply. No manual review needed.", accent: "linear-gradient(135deg,#10b981,#059669)" },
  { title: "Unique Apply Links", desc: "Each job posting gets a shareable link with your company slug. Students apply directly, no login friction.", accent: "linear-gradient(135deg,#8b5cf6,#6366f1)" },
  { title: "Smart Ranking Tables", desc: "Applications auto-sort into Highly Recommended, Minimum Met, and Not Qualified tiers powered by Groq.", accent: "linear-gradient(135deg,#f59e0b,#ef4444)" },
  { title: "Multi-Drive Management", desc: "Run internship and placement drives simultaneously. Each project has its own dashboard and analytics.", accent: "linear-gradient(135deg,#3b82f6,#8b5cf6)" },
  { title: "Live Skill Matching", desc: "AI maps candidate skill sets against required and preferred skills. Skill match percentage shown per applicant.", accent: "linear-gradient(135deg,#10b981,#3b82f6)" },
];

const PARTNERS = ["Google", "NASSCOM", "IIT Delhi", "Sequoia", "Y Combinator", "Microsoft"];

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ background: "var(--bg-0)" }}>
      {/* ══════════════════════ GLASSMORPHIC NAV ══════════════════════ */}
      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-glass" style={{ position: "absolute", inset: 0 }} />
        <div className="nav-inner" style={{ position: "relative", zIndex: 1 }}>
          {/* Logo */}
          <Link href="/" className="nav-logo">
            <span className="logo-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l3.5 3.5L12 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            PlaceAI
          </Link>

          {/* Center links */}
          <ul className="nav-links">
            <li><a href="#features" className="nav-link">Features</a></li>
            <li><a href="#how-it-works" className="nav-link">How it works</a></li>
            <li><a href="#reviews" className="nav-link">Reviews</a></li>
          </ul>

          {/* Right actions */}
          <div className="nav-actions">
            <Link href="/sign-in" className="btn btn-ghost">Sign in</Link>
            <Link href="/sign-up" className="btn btn-primary">Get started</Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section ref={heroRef} style={{ paddingTop: 160, paddingBottom: 96, position: "relative", overflow: "hidden" }}>
        {/* Ambient orbs */}
        <div className="glow" style={{ width: 600, height: 600, background: "radial-gradient(circle,#3b82f6,#8b5cf6)", top: -200, left: "50%", transform: "translateX(-50%)" }} />
        <div className="glow" style={{ width: 300, height: 300, background: "#10b981", top: 200, right: "5%", opacity: 0.12 }} />
        <div className="glow" style={{ width: 200, height: 200, background: "#f59e0b", top: 100, left: "5%", opacity: 0.1 }} />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          {/* Kicker */}
          <div className="flex justify-center mb-4 anim-up">
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 14px 5px 8px",
              border: "1px solid rgba(99,102,241,0.35)",
              borderRadius: 99,
              background: "rgba(99,102,241,0.08)",
              backdropFilter: "blur(12px)",
              fontSize: 12,
              fontWeight: 600,
              color: "#a5b4fc",
            }}>
              <span style={{ padding: "2px 8px", borderRadius: 99, background: "var(--grad-primary)", color: "#fff", fontSize: 11, fontWeight: 700 }}>NEW</span>
              Groq AI-powered recruitment platform
            </span>
          </div>

          {/* Headline with gradient */}
          <h1 className="anim-up-1 text-center" style={{ fontSize: "clamp(38px, 5.5vw, 66px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.05em", maxWidth: 760, margin: "0 auto 24px" }}>
            Smarter placements.{" "}
            <span className="grad-text">Powered by AI.</span>
          </h1>

          <p className="text-center anim-up-2" style={{ fontSize: 16.5, color: "var(--text-1)", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.75 }}>
            Students upload a resume and get matched automatically. Recruiters post a drive and receive{" "}
            <strong style={{ color: "var(--text-0)", fontWeight: 600 }}>AI-ranked candidates</strong>{" "}
            — within minutes.
          </p>

          {/* CTA */}
          <div className="flex justify-center gap-3 anim-up-3">
            <Link href="/sign-up" className="btn btn-primary btn-lg">
              Get started free
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link href="/sign-in" className="btn btn-secondary btn-lg">
              Sign in
            </Link>
          </div>

          {/* Floating trust badges */}
          <div className="flex justify-center gap-3 anim-up-4" style={{ marginTop: 28, flexWrap: "wrap" }}>
            {["No credit card", "Free forever tier", "Deploy in 5 min"].map((t) => (
              <span key={t} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-2)" }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l2.5 2.5L10 3" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {t}
              </span>
            ))}
          </div>

          {/* Stats row */}
          <div className="anim-up-5" style={{ display: "flex", gap: 0, marginTop: 80, borderTop: "1px solid var(--border-1)", borderBottom: "1px solid var(--border-1)", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.4),rgba(139,92,246,0.4),transparent)" }} />
            {STATS.map((s, i) => (
              <div key={i} style={{ flex: 1, padding: "28px 0", textAlign: "center", borderRight: i < STATS.length - 1 ? "1px solid var(--border-1)" : "none" }}>
                <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.05em", background: "var(--grad-hero)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{s.value}</div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-2)", marginTop: 5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ FEATURES ══════════════════════ */}
      <section id="features" style={{ padding: "80px 0", borderTop: "1px solid var(--border-0)", position: "relative" }}>
        <div className="glow" style={{ width: 400, height: 400, background: "#8b5cf6", top: "50%", right: -100, opacity: 0.08 }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ marginBottom: 56 }}>
            <div className="section-label mb-2">Features</div>
            <h2 style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-0.04em", maxWidth: 480 }}>
              Everything built around AI —{" "}
              <span className="grad-text-blue">not bolted on.</span>
            </h2>
          </div>

          <div className="grid-3" style={{ gap: 1, border: "1px solid var(--border-1)", borderRadius: "var(--radius-8)", overflow: "hidden" }}>
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="card-glow"
                style={{
                  padding: "28px 24px",
                  background: "linear-gradient(135deg, var(--bg-1) 0%, var(--bg-2) 100%)",
                  borderRight: i % 3 !== 2 ? "1px solid var(--border-1)" : "none",
                  borderBottom: i < 3 ? "1px solid var(--border-1)" : "none",
                  transition: "var(--t-slow)",
                  cursor: "default",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, var(--bg-2) 0%, var(--bg-3) 100%)";
                  e.currentTarget.style.transform = "scale(1.01)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, var(--bg-1) 0%, var(--bg-2) 100%)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <div style={{ width: 36, height: 4, background: f.accent, borderRadius: 2, marginBottom: 18 }} />
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text-1)", lineHeight: 1.75 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ HOW IT WORKS ══════════════════════ */}
      <section id="how-it-works" style={{ padding: "80px 0", borderTop: "1px solid var(--border-0)", position: "relative" }}>
        <div className="glow" style={{ width: 400, height: 400, background: "#3b82f6", bottom: 0, left: -100, opacity: 0.07 }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ marginBottom: 52 }}>
            <div className="section-label mb-2">How it works</div>
            <h2 style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-0.04em" }}>
              Two sides.{" "}
              <span className="grad-text-green">One platform.</span>
            </h2>
          </div>

          <div className="grid-2" style={{ gap: 24 }}>
            {/* Students */}
            <div className="card card-glass" style={{ padding: 28, border: "1px solid rgba(59,130,246,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--blue-dim)", border: "1px solid var(--blue-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--blue)" }} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", background: "linear-gradient(120deg, #60a5fa, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>For Students</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  { n: "01", title: "Upload resume", desc: "PDF, image, or text. AI extracts everything — no forms to fill." },
                  { n: "02", title: "Review your profile", desc: "Confirm the auto-filled data. Edit anything incorrect." },
                  { n: "03", title: "Apply via link", desc: "Use the company's unique URL to apply in one click." },
                  { n: "04", title: "Track your score", desc: "See your AI score and shortlist category in real time." },
                ].map((s, i, arr) => (
                  <div key={i} style={{ display: "flex", gap: 16, paddingBottom: i < arr.length - 1 ? 20 : 0, borderBottom: i < arr.length - 1 ? "1px solid var(--border-0)" : "none", marginBottom: i < arr.length - 1 ? 20 : 0 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--blue-dim)", border: "1px solid var(--blue-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "var(--blue)", flexShrink: 0, fontFamily: "JetBrains Mono, monospace", boxShadow: "0 0 10px rgba(59,130,246,0.2)" }}>
                      {s.n}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3, letterSpacing: "-0.01em" }}>{s.title}</div>
                      <div style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.65 }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recruiters */}
            <div className="card card-glass" style={{ padding: 28, border: "1px solid rgba(16,185,129,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--green-dim)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)" }} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", background: "linear-gradient(120deg, #34d399, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>For Recruiters</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  { n: "01", title: "Create company account", desc: "Set up your profile and company details in minutes." },
                  { n: "02", title: "Post a drive", desc: "Describe the role. AI analyzes and extracts requirements." },
                  { n: "03", title: "Share the link", desc: "One unique URL per posting. Share anywhere." },
                  { n: "04", title: "Review ranked candidates", desc: "AI sorts all applicants into three tiers automatically." },
                ].map((s, i, arr) => (
                  <div key={i} style={{ display: "flex", gap: 16, paddingBottom: i < arr.length - 1 ? 20 : 0, borderBottom: i < arr.length - 1 ? "1px solid var(--border-0)" : "none", marginBottom: i < arr.length - 1 ? 20 : 0 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--green-dim)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "var(--green)", flexShrink: 0, fontFamily: "JetBrains Mono, monospace", boxShadow: "0 0 10px rgba(16,185,129,0.2)" }}>
                      {s.n}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3, letterSpacing: "-0.01em" }}>{s.title}</div>
                      <div style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.65 }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ REVIEWS ══════════════════════ */}
      <section id="reviews" style={{ padding: "80px 0", borderTop: "1px solid var(--border-0)", position: "relative" }}>
        <div className="glow" style={{ width: 500, height: 500, background: "radial-gradient(circle,#8b5cf6,#3b82f6)", top: "30%", left: "50%", transform: "translateX(-50%)", opacity: 0.06 }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ marginBottom: 48 }}>
            <div className="section-label mb-2">Reviews</div>
            <h2 style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-0.04em" }}>
              What people are saying.
            </h2>
          </div>

          <div className="grid-2" style={{ gap: 16 }}>
            {REVIEWS.map((r, i) => (
              <div
                key={i}
                className="card card-hover card-glass"
                style={{ padding: "24px", border: `1px solid ${r.accent}22`, transition: "var(--t-slow)", position: "relative", overflow: "hidden" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${r.accent}44`; e.currentTarget.style.boxShadow = `0 8px 32px ${r.accent}18`; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${r.accent}22`; e.currentTarget.style.boxShadow = "none"; }}
              >
                {/* Top accent line */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${r.accent}80, transparent)` }} />

                <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                  {[0,1,2,3,4].map((s) => (
                    <svg key={s} width="13" height="13" viewBox="0 0 12 12" fill="#f59e0b">
                      <path d="M6 1l1.3 2.6 2.9.4-2.1 2 .5 2.9L6 7.5 3.4 8.9l.5-2.9-2.1-2 2.9-.4z"/>
                    </svg>
                  ))}
                </div>
                <p style={{ fontSize: 14, color: "var(--text-1)", lineHeight: 1.78, marginBottom: 20 }}>&ldquo;{r.quote}&rdquo;</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10, borderTop: "1px solid var(--border-0)", paddingTop: 16 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: `${r.accent}18`, border: `1px solid ${r.accent}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: r.accent, flexShrink: 0 }}>
                    {r.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-2)" }}>{r.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ PARTNERS ══════════════════════ */}
      <section style={{ padding: "52px 0", borderTop: "1px solid var(--border-0)" }}>
        <div className="container">
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-3)", textAlign: "center", marginBottom: 24 }}>Supported by</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {PARTNERS.map((p) => (
              <div key={p} className="card card-glass hover-lift" style={{ padding: "7px 18px", fontSize: 12, color: "var(--text-2)", fontWeight: 600, cursor: "default", letterSpacing: "0.01em" }}>{p}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ CTA ══════════════════════ */}
      <section style={{ padding: "96px 0", borderTop: "1px solid var(--border-0)", position: "relative", overflow: "hidden" }}>
        <div className="glow" style={{ width: 600, height: 600, background: "radial-gradient(circle,#3b82f6,#8b5cf6)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.12 }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 620, margin: "0 auto", textAlign: "center" }}>
            <div className="section-label mb-3">Get started today</div>
            <h2 style={{ fontSize: 38, fontWeight: 900, letterSpacing: "-0.05em", marginBottom: 16, lineHeight: 1.1 }}>
              Ready to hire{" "}
              <span className="grad-text">smarter?</span>
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-1)", marginBottom: 36, lineHeight: 1.78 }}>
              Create a free account and post your first drive in under 5 minutes. No credit card required.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/sign-up" className="btn btn-primary btn-lg">Create free account</Link>
              <Link href="/sign-in" className="btn btn-secondary btn-lg">Sign in</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ FOOTER ══════════════════════ */}
      <footer style={{ borderTop: "1px solid var(--border-0)", padding: "28px 0" }}>
        <div className="container">
          <div className="flex items-center justify-between" style={{ flexWrap: "wrap", gap: 12 }}>
            <Link href="/" className="nav-logo" style={{ fontSize: 14 }}>
              <span className="logo-icon" style={{ width: 22, height: 22, borderRadius: 6 }}>
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7l3.5 3.5L12 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              PlaceAI
            </Link>
            <p style={{ fontSize: 12, color: "var(--text-3)" }}>
              © 2026 PlaceAI · Powered by{" "}
              <span style={{ background: "linear-gradient(90deg,#f59e0b,#ef4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontWeight: 600 }}>Groq</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
