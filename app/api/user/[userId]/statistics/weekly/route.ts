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
    
    // Use the correct URL structure as shown in the curl command
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/user/${userId}/statistics/weekly`;
    
    // Forward the request to your actual API
    const response = await fetch(
      apiUrl,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${session.session.token}`,
        },
        // In development mode, ignore SSL certificate validation
        ...(process.env.NODE_ENV === "development" && {
          agent: new https.Agent({
            rejectUnauthorized: false,
          }),
        }),
      }
    );
    
    // Handle different response statuses
    if (response.status === 404) {
      return NextResponse.json([], { status: 200 });
    }
    
    if (response.status !== 200) {
      return NextResponse.json(
        { error: `API error: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Return the statistics data
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}