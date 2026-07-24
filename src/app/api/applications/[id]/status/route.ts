import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applications } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "recruiter") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await req.json();

    const VALID = ["applied", "shortlisted", "rejected", "hired"];
    if (!VALID.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await db
      .update(applications)
      .set({ status, updatedAt: new Date().toISOString() })
      .where(eq(applications.id, id));

    return NextResponse.json({ success: true, status });
  } catch (err) {
    console.error("Status update error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
