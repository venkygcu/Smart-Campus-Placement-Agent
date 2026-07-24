import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth";

const publicRoutes = ["/", "/sign-in", "/sign-up", "/apply"];
const studentRoutes = ["/student"];
const recruiterRoutes = ["/recruiter"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and API routes
  if (
    publicRoutes.some((r) => pathname === r || pathname.startsWith(r + "/")) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const session = await verifySession(token);
  if (!session) {
    const response = NextResponse.redirect(new URL("/sign-in", request.url));
    response.cookies.delete("session");
    return response;
  }

  // Role-based redirects
  if (studentRoutes.some((r) => pathname.startsWith(r)) && session.role !== "student") {
    return NextResponse.redirect(new URL("/recruiter/dashboard", request.url));
  }
  if (recruiterRoutes.some((r) => pathname.startsWith(r)) && session.role !== "recruiter") {
    return NextResponse.redirect(new URL("/student/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
