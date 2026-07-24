# Smart Campus Placement Agent

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Live Preview

Live Preview: https://smart-campus-placement-agent.vercel.app/

---

## Overview

Smart Campus Placement Agent is a full-stack AI-powered campus placement and internship portal that automates candidate screening and matching using large language models. It is designed for colleges, bootcamps, and companies running structured hiring pipelines.

The platform serves two user roles:

- **Students** — upload a resume, have their profile auto-populated by AI, browse and apply to positions shared by companies
- **Recruiters** — post internships or full-time roles, get every applicant automatically scored and categorized by AI, review full candidate profiles and manage application statuses

---

## Key Features

### For Students
- Resume upload with AI parsing (PDF, image, plain text supported)
- Auto-populated profile: name, education, skills, experience, projects, links
- Skills autocomplete with a database of 500+ technologies
- Apply to any position via a company-shared link
- Track all applications and AI scores in a personal dashboard

### For Recruiters
- Post internship or placement roles with structured requirements
- AI analysis of every job description (required skills, CGPA floor, difficulty level)
- Automatic candidate scoring (0-100) and categorization on application submission:
  - **Top pick** (score >= 80)
  - **Minimum met** (score 50-79)
  - **Not qualified** (score < 50)
- Expandable candidate cards showing: AI reasoning, skills, experience, projects, bio, achievements, resume text, cover letter, all contact links
- Status management per application: Applied, Shortlisted, Rejected, Hired
- Shareable application link per role

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | Turso (libSQL / SQLite edge) |
| ORM | Drizzle ORM |
| AI | Groq API (Llama 3.1 8B, Llama 3.3 70B) |
| Auth | JWT via jose |
| Styling | Vanilla CSS with glassmorphism design system |
| PDF Parsing | Pure Node.js zlib (zero native dependencies) |
| Deployment | Vercel-compatible |

---

## Project Structure

```
app/
  src/
    app/
      api/                    # All API routes
        auth/                 # Sign-in, sign-up, sign-out
        student/              # Profile, applications
        recruiter/            # Profile, projects
        projects/             # Project CRUD, applications
        resume/parse/         # AI resume parsing endpoint
        applications/         # Application status updates
      student/                # Student-facing pages (dashboard, profile, apply)
      recruiter/              # Recruiter-facing pages (dashboard, projects)
      sign-in/
      sign-up/
    components/
      SkillsInput.tsx         # Tag-style skills autocomplete component
    lib/
      db/                     # Drizzle schema and client
      groq.ts                 # AI integration (resume parse, project analysis, scoring)
      auth.ts                 # Session management
      skills.ts               # 500+ skill database for autocomplete
      extractPdfText.ts       # Pure-JS FlateDecode PDF extractor
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Turso](https://turso.tech) database (free tier works)
- A [Groq](https://console.groq.com) API key (free tier works)

### Setup

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/venkygcu/Smart-Campus-Placement-Agent.git
cd Smart-Campus-Placement-Agent
npm install
```

2. Create `.env.local` from the example:

```bash
cp .env.example .env.local
```

3. Fill in your credentials in `.env.local`:

```env
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your_token
GROQ_API_KEY=gsk_...
AUTH_SECRET=any_random_32char_string
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Push the database schema:

```bash
TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npx drizzle-kit push
```

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How AI Scoring Works

When a student applies to a role, the system:

1. Reads the student's structured profile (skills, CGPA, degree, experience) — extracted once at signup, stored in the database
2. Reads the job's pre-analyzed requirements (required skills, CGPA floor) — extracted once at job creation, cached in the database
3. Sends a compact, token-efficient context (~500 tokens) to `llama-3.1-8b-instant` for scoring
4. Stores the score, category, reasoning, and skill match percentage with the application record
5. Never re-computes the same student-job pair twice (cached)

This approach reduces token usage by approximately 80% compared to sending raw resume text on every application.

---

## Environment Variables

| Variable | Description |
|---|---|
| `TURSO_DATABASE_URL` | Your Turso database URL |
| `TURSO_AUTH_TOKEN` | Turso auth token |
| `GROQ_API_KEY` | Groq API key for AI features |
| `AUTH_SECRET` | Secret for signing JWT sessions (any random string) |
| `NEXT_PUBLIC_APP_URL` | Public URL of the app (used for link generation) |

---

## Database Schema

Four tables:

- `users` — Auth credentials (email, hashed password, role)
- `student_profiles` — Full student profile with AI-extracted resume data
- `recruiter_profiles` — Company and recruiter details
- `projects` — Job/internship postings with AI analysis cached
- `applications` — Application records with AI score, category, reasoning

---

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # ESLint
npm run db:push      # Push schema changes to Turso
npm run db:generate  # Generate Drizzle migration files
```

---

## License

MIT License. Open source and free to use.

---
