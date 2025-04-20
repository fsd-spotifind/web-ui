import { NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "@/lib/auth";
import https from "https";

type Session = typeof auth.$Infer.Session;

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  album: {
    id: string;
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
}

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
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/user/${userId}/sotds/recommended`;
    
    // Forward the request to your actual API
    const response = await fetch(
      apiUrl,
      {
        headers: {
          // Add any auth headers needed for your API
        },
        // Ignore SSL certificate validation in development mode
        ...(process.env.NODE_ENV === 'development' && {
          agent: new https.Agent({ rejectUnauthorized: false })
        })
      }
    );
    
    // If the API returns 404, no recommendations found
    if (response.status === 404) {
      return NextResponse.json({ items: [] }, { status: 200 });
    }
    
    // For non-200 responses, return the error
    if (!response.ok) {
      return NextResponse.json(
        { error: `API error: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Return the recommended tracks data
    const data = await response.json();
    
    // Check if the response has an 'items' array (Spotify format)
    if (data.items && Array.isArray(data.items)) {
      // Extract just the track objects from the items array
      const tracks = data.items.map((item: { track: SpotifyTrack }) => item.track);
      
      // Return the tracks in the format our frontend expects
      return NextResponse.json({ tracks });
    }
    
    // Check if tracks property exists
    if (!data.tracks) {
      // If the response is an array directly, wrap it in a tracks property
      if (Array.isArray(data)) {
        return NextResponse.json({ tracks: data });
      }
    }
    
    return NextResponse.json(data);
    
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch recommended tracks" },
      { status: 500 }
    );
  }
} 