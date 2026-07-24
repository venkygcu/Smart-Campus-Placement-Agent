import { sql } from "drizzle-orm";
import {
  text,
  integer,
  sqliteTable,
  real,
} from "drizzle-orm/sqlite-core";

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["student", "recruiter"] }).notNull(),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// ─── Student Profiles ─────────────────────────────────────────────────────────
export const studentProfiles = sqliteTable("student_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  college: text("college"),
  degree: text("degree"),
  branch: text("branch"),
  graduationYear: integer("graduation_year"),
  cgpa: real("cgpa"),
  skills: text("skills"), // JSON array stored as text
  experience: text("experience"), // JSON array
  projects: text("projects"), // JSON array
  achievements: text("achievements"),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  portfolioUrl: text("portfolio_url"),
  resumeText: text("resume_text"), // extracted text from PDF
  resumeUrl: text("resume_url"),
  location: text("location"),
  bio: text("bio"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// ─── Recruiter Profiles ───────────────────────────────────────────────────────
export const recruiterProfiles = sqliteTable("recruiter_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  companyName: text("company_name").notNull(),
  companyWebsite: text("company_website"),
  companySize: text("company_size"),
  industry: text("industry"),
  designation: text("designation"),
  location: text("location"),
  logoUrl: text("logo_url"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// ─── Projects (Job Postings) ──────────────────────────────────────────────────
export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  recruiterId: text("recruiter_id").notNull().references(() => recruiterProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type", { enum: ["internship", "placement"] }).notNull(),
  companyName: text("company_name").notNull(),
  slug: text("slug").notNull().unique(), // company-name-XXXXX
  location: text("location"),
  salaryMin: real("salary_min"),
  salaryMax: real("salary_max"),
  currency: text("currency").default("INR"),
  duration: text("duration"), // for internship
  minimumRequirements: text("minimum_requirements"), // JSON
  preferredRequirements: text("preferred_requirements"), // JSON
  aiAnalysis: text("ai_analysis"), // Groq AI analysis of the project
  requiredSkills: text("required_skills"), // JSON array
  preferredSkills: text("preferred_skills"), // JSON array
  minCgpa: real("min_cgpa"),
  openings: integer("openings").default(1),
  deadline: text("deadline"),
  status: text("status", { enum: ["active", "closed", "draft"] }).default("active"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// ─── Applications ─────────────────────────────────────────────────────────────
export const applications = sqliteTable("applications", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  studentId: text("student_id").notNull().references(() => studentProfiles.id, { onDelete: "cascade" }),
  status: text("status", {
    enum: ["applied", "shortlisted", "rejected", "hired"],
  }).default("applied"),
  aiScore: real("ai_score"), // 0-100 score from Groq
  aiCategory: text("ai_category", {
    enum: ["highly_recommended", "minimum_met", "not_qualified"],
  }),
  aiReasoning: text("ai_reasoning"), // Groq analysis
  skillMatch: real("skill_match"), // percentage
  coverLetter: text("cover_letter"),
  appliedAt: text("applied_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});
