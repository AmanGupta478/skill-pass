import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    const role = (payload.role as string)?.toLowerCase();
    const pathname = req.nextUrl.pathname;

    if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (pathname.startsWith("/dashboard/student") && role !== "student") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (pathname.startsWith("/dashboard/verifier") && role !== "verifier") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  } catch (err) {
    console.error("JWT verification failed:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
