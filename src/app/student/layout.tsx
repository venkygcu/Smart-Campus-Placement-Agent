"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/student/dashboard", label: "Dashboard" },
  { href: "/student/applications", label: "Applications" },
  { href: "/student/profile", label: "Profile" },
  { href: "/student/settings", label: "Settings" },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<{ fullName: string; email: string; college?: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setProfile({ fullName: d.profile?.fullName || "Student", email: d.session?.email || "", college: d.profile?.college }))
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
              {profile.college && (
                <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>{profile.college}</div>
              )}
              <div style={{ marginTop: 8 }}>
                <span className="badge badge-blue">Student</span>
              </div>
            </div>
          )}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-label">Navigation</div>
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href} className={`sidebar-link ${pathname === href ? "active" : ""}`}>
              <span className="sidebar-link-dot" />
              {label}
            </Link>
          ))}
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
