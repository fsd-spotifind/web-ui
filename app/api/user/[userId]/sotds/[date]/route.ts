import { NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "@/lib/auth";
import https from "https";

type Session = typeof auth.$Infer.Session;

// GET handler to check if a user has a SOTD for a specific date
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string; date: string }> }
) {
  try {
    // Ensure params are available
    const params = await context.params;
    const userId = params.userId;
    const date = params.date;
    
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
      console.error("NEXT_PUBLIC_API_URL environment variable is not defined");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }
    
    // Use the correct URL structure as shown in the curl command
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/user/${userId}/sotds/${date}`;
    console.log(`[DEBUG] Making request to: ${apiUrl}`);
    
    // Forward the request to your actual API
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
    
    // If the API returns 404, the user hasn't selected an SOTD for this date
    if (response.status === 404) {
      return NextResponse.json({ error: "No SOTD found for this date" }, { status: 404 });
    }
    
    // For other non-200 responses, return the error
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}): ${errorText}`);
      return NextResponse.json(
        { error: `API error: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Return the SOTD data
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Error fetching SOTD:", error);
    return NextResponse.json(
      { error: "Failed to fetch Song of the Day" },
      { status: 500 }
    );
  }
}

// POST handler to create or update a user's SOTD for a specific date
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string; date: string }> }
) {
  try {
    // Ensure params are available
    const params = await context.params;
    const userId = params.userId;
    const date = params.date;
    
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
      console.error("NEXT_PUBLIC_API_URL environment variable is not defined");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }
    
    // Get the song data from the request
    const data = await request.json();
    
    // Use the correct URL structure as shown in the curl command
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/user/${userId}/sotds/${date}`;
    console.log(`[DEBUG] Making POST request to: ${apiUrl}`);
    
    // Forward the request to your actual API
    const response = await fetch(
      apiUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.token}`,
        },
        body: JSON.stringify(data),
        // Ignore SSL certificate validation in development mode
        ...(process.env.NODE_ENV === 'development' && {
          agent: new https.Agent({ rejectUnauthorized: false })
        })
      }
    );
    
    // For non-200 responses, return the error
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}): ${errorText}`);
      return NextResponse.json(
        { error: `API error: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Return the created/updated SOTD data
    const responseData = await response.json();
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error("Error saving SOTD:", error);
    return NextResponse.json(
      { error: "Failed to save Song of the Day" },
      { status: 500 }
    );
  }
} 