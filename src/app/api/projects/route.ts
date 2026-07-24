import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects, recruiterProfiles } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { generateId, generateProjectSlug } from "@/lib/utils";
import { analyzeProject } from "@/lib/groq";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "recruiter") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, type, location, minRequirements, preferredRequirements, salaryMin, salaryMax, duration, openings, deadline } = body;

    if (!title || !description || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [recruiter] = await db
      .select()
      .from(recruiterProfiles)
      .where(eq(recruiterProfiles.userId, session.userId))
      .limit(1);

    if (!recruiter) {
      return NextResponse.json({ error: "Recruiter profile not found" }, { status: 404 });
    }

    // AI Analysis
    const aiAnalysis = await analyzeProject(title, description, minRequirements || "", preferredRequirements || "", type);

    const slug = generateProjectSlug(recruiter.companyName);
    const projectId = generateId();

    await db.insert(projects).values({
      id: projectId,
      recruiterId: recruiter.id,
      title,
      description,
      type,
      companyName: recruiter.companyName,
      slug,
      location: location || null,
      salaryMin: salaryMin || null,
      salaryMax: salaryMax || null,
      duration: duration || null,
      minimumRequirements: minRequirements || null,
      preferredRequirements: preferredRequirements || null,
      aiAnalysis: JSON.stringify(aiAnalysis),
      requiredSkills: JSON.stringify(aiAnalysis.requiredSkills || []),
      preferredSkills: JSON.stringify(aiAnalysis.preferredSkills || []),
      minCgpa: (aiAnalysis.minCgpa as number | null) || null,
      openings: openings || 1,
      deadline: deadline || null,
      status: "active",
    });

    return NextResponse.json({ success: true, slug, projectId, aiAnalysis });
  } catch (err) {
    console.error("Project create error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "recruiter") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [recruiter] = await db
      .select()
      .from(recruiterProfiles)
      .where(eq(recruiterProfiles.userId, session.userId))
      .limit(1);

    if (!recruiter) {
      return NextResponse.json({ projects: [] });
    }

    const recruiterProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.recruiterId, recruiter.id))
      .orderBy(projects.createdAt);

    return NextResponse.json({ projects: recruiterProjects });
  } catch (err) {
    console.error("Projects fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
