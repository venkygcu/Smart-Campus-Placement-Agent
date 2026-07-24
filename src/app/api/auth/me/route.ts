import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { studentProfiles, recruiterProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role === "student") {
    const [profile] = await db
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.userId, session.userId))
      .limit(1);
    return NextResponse.json({ session, profile: profile || null });
  } else {
    const [profile] = await db
      .select()
      .from(recruiterProfiles)
      .where(eq(recruiterProfiles.userId, session.userId))
      .limit(1);
    return NextResponse.json({ session, profile: profile || null });
  }
}
