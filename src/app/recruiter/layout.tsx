"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/recruiter/dashboard", label: "Dashboard" },
  { href: "/recruiter/projects", label: "Projects" },
  { href: "/recruiter/settings", label: "Settings" },
];

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<{ fullName: string; email: string; companyName?: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setProfile({ fullName: d.profile?.fullName || "Recruiter", email: d.session?.email || "", companyName: d.profile?.companyName }))
      .catch(() => router.push("/sign-in"));
  }, [router]);

  const signOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/");
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-top">
          <Link href="/" className="nav-logo" style={{ fontSize: 13, marginBottom: 14, display: "flex" }}>
            <span className="logo-icon" style={{ width: 20, height: 20 }}>
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l3.5 3.5L12 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            PlaceAI
          </Link>

          {profile && (
            <div style={{ marginTop: 2 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-0)", lineHeight: 1.3 }}>{profile.fullName}</div>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>{profile.email}</div>
              {profile.companyName && <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>{profile.companyName}</div>}
              <div style={{ marginTop: 8 }}><span className="badge badge-green">Recruiter</span></div>
            </div>
          )}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-label">Navigation</div>
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href} className={`sidebar-link ${pathname.startsWith(href) && (href !== "/recruiter/projects" || pathname === href) ? "active" : ""}`}>
              <span className="sidebar-link-dot" />
              {label}
            </Link>
          ))}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-label">Actions</div>
          <Link href="/recruiter/projects/new" className="sidebar-link" style={{ color: "var(--blue)" }}>
            <span className="sidebar-link-dot" style={{ background: "var(--blue)" }} />
            New project
          </Link>
        </div>

        <div className="sidebar-bottom">
          <button onClick={signOut} className="sidebar-link" style={{ background: "none", border: "none", width: "100%", cursor: "pointer", color: "var(--text-2)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-2)")}
          >
            <span className="sidebar-link-dot" style={{ background: "var(--red)" }} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="main">
        <div className="main-inner">{children}</div>
      </main>
    </div>
  );
}
