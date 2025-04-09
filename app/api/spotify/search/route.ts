import { NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "@/lib/auth";

type Session = typeof auth.$Infer.Session;

// Define Spotify track type
interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{
    name: string;
  }>;
  album: {
    name: string;
    images: Array<{
      url: string;
    }>;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get the search query from the URL
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    
    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 });
    }
    
    // Get the Spotify access token
    // For BetterAuth, we need to get the token from the session
    // This is a simplified approach - you may need to adjust based on your actual auth setup
    const token = session.session?.token;
    
    if (!token) {
      return NextResponse.json({ error: "No authentication token found" }, { status: 401 });
    }
    
    // Search for tracks on Spotify
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Spotify API error: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Transform the Spotify response to match our Track interface
    const tracks = data.tracks.items.map((track: SpotifyTrack) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      albumCoverUrl: track.album.images[0]?.url || "",
    }));
    
    return NextResponse.json({ tracks });
    
  } catch (error) {
    console.error("Error searching Spotify:", error);
    return NextResponse.json(
      { error: "Failed to search Spotify" },
      { status: 500 }
    );
  }
} 