import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isTokenValid } from "@/lib/auth";

// This file is a convenience: it sends visitors without a usable session to the
// login page. It can only read the token (shape and expiry date). It cannot
// check the signature, so the API must still refuse requests without a valid token.
export function proxy(request: NextRequest) {
  const token = request.cookies.get("adminToken")?.value;
  const hasSession = isTokenValid(token);
  const currentPath = request.nextUrl.pathname;

  // Login page: a visitor with a session goes straight to the dashboard.
  if (currentPath === "/") {
    if (hasSession) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Every other matched page needs a session.
  if (hasSession) {
    return NextResponse.next();
  }

  const response = NextResponse.redirect(new URL("/", request.url));
  if (token) {
    // Remove a stale or broken cookie so it does not linger.
    response.cookies.delete("adminToken");
  }
  return response;
}

export const config = {
  matcher: [
    "/",
    "/dashboard", "/dashboard/:path*",
    "/planning", "/planning/:path*",
    "/requests", "/requests/:path*",
    "/staff", "/staff/:path*",
    "/audit", "/audit/:path*",
    "/settings", "/settings/:path*",
  ],
};
