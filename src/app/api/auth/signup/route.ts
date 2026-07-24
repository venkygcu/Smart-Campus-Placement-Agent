import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, studentProfiles, recruiterProfiles } from "@/lib/db/schema";
import { createSession, hashPassword } from "@/lib/auth";
import { generateId } from "@/lib/utils";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, role, profile } = body;

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check existing user
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashed = await hashPassword(password);
    const userId = generateId();

    await db.insert(users).values({
      id: userId,
      email,
      password: hashed,
      role,
    });

    if (role === "student" && profile) {
      await db.insert(studentProfiles).values({
        id: generateId(),
        userId,
        email,
        fullName: profile.fullName || "",
        phone: profile.phone || null,
        college: profile.college || null,
        degree: profile.degree || null,
        branch: profile.branch || null,
        graduationYear: profile.graduationYear || null,
        cgpa: profile.cgpa || null,
        skills: JSON.stringify(profile.skills || []),
        experience: JSON.stringify(profile.experience || []),
        projects: JSON.stringify(profile.projects || []),
        achievements: profile.achievements || null,
        linkedinUrl: profile.linkedinUrl || null,
        githubUrl: profile.githubUrl || null,
        portfolioUrl: profile.portfolioUrl || null,
        resumeText: profile.resumeText || null,
        location: profile.location || null,
        bio: profile.bio || null,
      });
    } else if (role === "recruiter" && profile) {
      await db.insert(recruiterProfiles).values({
        id: generateId(),
        userId,
        email,
        fullName: profile.fullName || "",
        phone: profile.phone || null,
        companyName: profile.companyName || "",
        companyWebsite: profile.companyWebsite || null,
        companySize: profile.companySize || null,
        industry: profile.industry || null,
        designation: profile.designation || null,
        location: profile.location || null,
      });
    }

    const token = await createSession({ userId, email, role });

    const response = NextResponse.json({ success: true, role });
    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
