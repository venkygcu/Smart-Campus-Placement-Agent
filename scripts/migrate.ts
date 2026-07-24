import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function migrate() {
  console.log("🚀 Running database migrations...");

  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'recruiter')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS student_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      college TEXT,
      degree TEXT,
      branch TEXT,
      graduation_year INTEGER,
      cgpa REAL,
      skills TEXT,
      experience TEXT,
      projects TEXT,
      achievements TEXT,
      linkedin_url TEXT,
      github_url TEXT,
      portfolio_url TEXT,
      resume_text TEXT,
      resume_url TEXT,
      location TEXT,
      bio TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS recruiter_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      company_name TEXT NOT NULL,
      company_website TEXT,
      company_size TEXT,
      industry TEXT,
      designation TEXT,
      location TEXT,
      logo_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      recruiter_id TEXT NOT NULL REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('internship', 'placement')),
      company_name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      location TEXT,
      salary_min REAL,
      salary_max REAL,
      currency TEXT DEFAULT 'INR',
      duration TEXT,
      minimum_requirements TEXT,
      preferred_requirements TEXT,
      ai_analysis TEXT,
      required_skills TEXT,
      preferred_skills TEXT,
      min_cgpa REAL,
      openings INTEGER DEFAULT 1,
      deadline TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'closed', 'draft')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'applied' CHECK(status IN ('applied', 'shortlisted', 'rejected', 'hired')),
      ai_score REAL,
      ai_category TEXT CHECK(ai_category IN ('highly_recommended', 'minimum_met', 'not_qualified')),
      ai_reasoning TEXT,
      skill_match REAL,
      cover_letter TEXT,
      applied_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  console.log("✅ All tables created successfully!");
  process.exit(0);
}

migrate().catch((e) => { console.error("Migration failed:", e); process.exit(1); });
