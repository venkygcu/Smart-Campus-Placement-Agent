import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applications, projects } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { studentProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [student] = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, session.userId))
    .limit(1);

  if (!student) return NextResponse.json({ applications: [] });

  const apps = await db
    .select({ application: applications, project: projects })
    .from(applications)
    .innerJoin(projects, eq(applications.projectId, projects.id))
    .where(eq(applications.studentId, student.id));

  return NextResponse.json({ applications: apps });
}
