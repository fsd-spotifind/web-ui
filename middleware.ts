import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type Session = typeof auth.$Infer.Session;

export async function middleware(request: NextRequest) {
  // Skip middleware for auth-related routes
  if (request.nextUrl.pathname.startsWith('/auth/')) {
    return NextResponse.next();
  }

  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") || "", // Forward the cookies from the request
      },
    }
  );

  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const userId = session.user.id;

  // If the user is on the root path, redirect to their profile
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL(`/profile/${userId}`, request.url));
    // return NextResponse.redirect(new URL(`/profile/${userId}`, request.url));
  }

  // For other routes, just continue
  return NextResponse.next();
}

export const config = {
  // Apply middleware to specific routes
  matcher: ["/", "/profile/:path*"],
};
