import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { studentProfiles } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [profile] = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, session.userId))
    .limit(1);
  return NextResponse.json({ profile: profile || null });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();

  const updateData: Partial<typeof studentProfiles.$inferInsert> = {};
  const fields = ["fullName", "phone", "college", "degree", "branch", "graduationYear", "cgpa", "location", "bio", "linkedinUrl", "githubUrl", "portfolioUrl", "achievements"];
  for (const f of fields) {
    if (body[f] !== undefined) (updateData as Record<string, unknown>)[f] = body[f];
  }
  if (body.skills !== undefined) updateData.skills = JSON.stringify(body.skills);
  if (body.experience !== undefined) updateData.experience = JSON.stringify(body.experience);
  if (body.projects !== undefined) updateData.projects = JSON.stringify(body.projects);

  await db.update(studentProfiles).set(updateData).where(eq(studentProfiles.userId, session.userId));
  return NextResponse.json({ success: true });
}
