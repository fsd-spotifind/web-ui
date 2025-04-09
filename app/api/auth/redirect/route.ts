import { NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "@/lib/auth";

type Session = typeof auth.$Infer.Session;

export async function GET(request: NextRequest) {
  try {
    // Get the current session
    const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });
    
    if (!session) {
      // If no session, redirect to login page
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    
    // Get the user ID from the session
    const userId = session.user.id;
    
    // Redirect to the user's profile page
    return NextResponse.redirect(new URL(`/profile/${userId}`, request.url));
    
  } catch (error) {
    console.error("Error in auth redirect:", error);
    // On error, redirect to login page
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
} 