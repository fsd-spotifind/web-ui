import { NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "@/lib/auth";
import https from "https";

type Session = typeof auth.$Infer.Session;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // Ensure params are available
    const params = await context.params;
    const userId = params.userId;
    
    // Verify the user is authenticated
    const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });
    
    // If no session or userId doesn't match session user, return unauthorized
    if (!session || session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if API_URL is defined
    if (!process.env.NEXT_PUBLIC_API_URL) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Forward the request to your actual API
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`;
    
    const response = await fetch(
      apiUrl,
      {
        headers: {
          'Authorization': `Bearer ${session.session.token}`,
        },
        // Ignore SSL certificate validation in development mode
        ...(process.env.NODE_ENV === 'development' && {
          agent: new https.Agent({ rejectUnauthorized: false })
        })
      }
    );
    
    // For non-200 responses, return the error
    if (!response.ok) {
      return NextResponse.json(
        { error: `API error: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Return the profile data
    const data = await response.json();
    
    return NextResponse.json(data);
    
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
} 