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
    
    console.log(`[DEBUG] Fetching SOTDs for user: ${userId}`);
    
    // Verify the user is authenticated
    const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });
    
    console.log(`[DEBUG] Session found: ${!!session}`);
    
    // If no session or userId doesn't match session user, return unauthorized
    if (!session || session.user.id !== userId) {
      console.log(`[DEBUG] Unauthorized access. Session user: ${session?.user?.id}, Requested user: ${userId}`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if API_URL is defined
    if (!process.env.NEXT_PUBLIC_API_URL) {
      console.error("NEXT_PUBLIC_API_URL environment variable is not defined");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }
    
    // Use the correct URL structure as shown in the curl command
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/user/${userId}/sotds`;
    console.log(`[DEBUG] Making request to: ${apiUrl}`);
    
    // Forward the request to your actual API
    const response = await fetch(
      apiUrl,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Ignore SSL certificate validation in development mode
        ...(process.env.NODE_ENV === 'development' && {
          agent: new https.Agent({ rejectUnauthorized: false })
        })
      }
    );
    
    console.log(`[DEBUG] API response status: ${response.status}`);
    
    // If the API returns 404, no SOTDs found
    if (response.status === 404) {
      console.log(`[DEBUG] No SOTDs found (404)`);
      return NextResponse.json({ entries: {} }, { status: 200 });
    }
    
    // For other non-200 responses, return the error
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DEBUG] API error (${response.status}): ${errorText}`);
      return NextResponse.json(
        { error: `API error: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Return the SOTDs data
    const data = await response.json();
    console.log(`[DEBUG] Received SOTDs data:`, data);
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("[DEBUG] Error fetching SOTDs:", error);
    return NextResponse.json(
      { error: "Failed to fetch SOTDs" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // Ensure params are available
    const params = await context.params;
    const userId = params.userId;
    
    console.log(`[DEBUG] Creating SOTD for user: ${userId}`);
    
    // Verify the user is authenticated
    const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });
    
    console.log(`[DEBUG] Session found: ${!!session}`);
    
    // If no session or userId doesn't match session user, return unauthorized
    if (!session || session.user.id !== userId) {
      console.log(`[DEBUG] Unauthorized access. Session user: ${session?.user?.id}, Requested user: ${userId}`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if API_URL is defined
    if (!process.env.NEXT_PUBLIC_API_URL) {
      console.error("NEXT_PUBLIC_API_URL environment variable is not defined");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Get the track data from the request body
    const trackData = await request.json();
    
    // Forward the request to your actual API
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/user/${userId}/sotds`;
    console.log(`[DEBUG] Making request to: ${apiUrl}`);
    
    const response = await fetch(
      apiUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(trackData),
        // Ignore SSL certificate validation in development mode
        ...(process.env.NODE_ENV === 'development' && {
          agent: new https.Agent({ rejectUnauthorized: false })
        })
      }
    );
    
    console.log(`[DEBUG] API response status: ${response.status}`);
    
    // For non-200 responses, return the error
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[DEBUG] API error (${response.status}): ${errorText}`);
      return NextResponse.json(
        { error: `API error: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Return the created SOTD data
    const data = await response.json();
    console.log(`[DEBUG] Created SOTD:`, JSON.stringify(data));
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("[DEBUG] Error creating SOTD:", error);
    return NextResponse.json(
      { error: "Failed to create SOTD" },
      { status: 500 }
    );
  }
} 