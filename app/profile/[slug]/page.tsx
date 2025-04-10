"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { SotdCard } from "@/components/molecules/sotd-card";
import { ProfileSection } from "@/components/molecules/profile-section";
import { Recap } from "@/components/molecules/recap";
import { vibeThemes } from "@/constants/recap-theme";

// Define the SOTD data type
interface SotdData {
  id: string;
  userId: string;
  trackId: string;
  note: string;
  mood: string;
  setAt: string;
  createdAt: string;
  updatedAt: string;
  track: {
    id: string;
    name: string;
    artists: Array<{
      id: string;
      name: string;
    }>;
    album: {
      id: string;
      name: string;
      images: Array<{
        url: string;
        height: number;
        width: number;
      }>;
    };
  };
}

interface SpotifyProfile {
  id: string;
  name: string;
  image: string;
  product: string;
  type: string;
  uri: string;
}

// Add statistics interface
interface Statistics {
  id: string;
  userId: string;
  period: string;
  totalTracks: number;
  totalDuration: number;
  uniqueArtists: number;
  vibe: string;
  topTracks: Array<{
    id: string;
    name: string;
    artists: Array<{
      id: string;
      name: string;
    }>;
    album: {
      id: string;
      name: string;
      total_tracks: number;
      images: Array<{
        url: string;
        height: number;
        width: number;
      }>;
      release_date: string;
    };
    duration_ms: number;
    popularity: number;
  }>;
  topArtists: Array<{
    id: string;
    name: string;
    genres: string[];
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
    popularity: number;
  }>;
  topAlbums: Array<{
    id: string;
    name: string;
    total_tracks: number;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
    release_date: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const TABS = ["Song of the Day", "Spotify Recap"];

export default function Profile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]>("Song of the Day");
  const [profile, setProfile] = useState<SpotifyProfile | null>(null);
  const [sotdData, setSotdData] = useState<SotdData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasNoSotd, setHasNoSotd] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>("");
  // Add statistics state
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  // Set current date in useEffect to avoid hydration mismatch
  useEffect(() => {
    // Get current date in YYYY-MM-DD format using UTC
    const date = new Date();
    const offset = date.getTimezoneOffset();
    const utcDate = new Date(date.getTime() - offset * 60 * 1000)
      .toISOString()
      .split("T")[0];
    setCurrentDate(utcDate);
  }, []);

  // Fetch all data in a single useEffect to avoid race conditions
  useEffect(() => {
    const fetchAllData = async () => {
      if (!currentDate) return; // Wait for currentDate to be set

      setIsLoading(true);
      setError(null);
      setHasNoSotd(false);

      try {
        // Fetch profile data
        const profileResponse = await fetch(`/api/user/${resolvedParams.slug}`);
        if (!profileResponse.ok) {
          throw new Error(
            `Failed to fetch profile: ${await profileResponse.text()}`
          );
        }
        const profileData = await profileResponse.json();
        setProfile(profileData);

        // Fetch statistics data
        const statsResponse = await fetch(
          `/api/user/${resolvedParams.slug}/statistics/weekly`
        );

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();

          // Check if we have statistics data
          if (statsData && statsData.length > 0) {
            setStatistics(statsData[0]); // Use the first entry
          } else {
            setStatistics(null);
          }
        } else if (statsResponse.status !== 404) {
          // Don't throw error for 404, just set statistics to null
        }

        // Fetch SOTD data
        const sotdResponse = await fetch(
          `/api/user/${resolvedParams.slug}/sotds`
        );

        if (sotdResponse.ok) {
          const sotdData = await sotdResponse.json();

          // Check if there's an entry for today's date
          if (
            sotdData.entries &&
            sotdData.entries[currentDate] &&
            sotdData.entries[currentDate].length > 0
          ) {
            // Get the first SOTD for today
            const todaySotd = sotdData.entries[currentDate][0];
            setSotdData(todaySotd);
            setHasNoSotd(false);
          } else {
            setSotdData(null);
            setHasNoSotd(true);
          }
        } else if (sotdResponse.status === 404) {
          setSotdData(null);
          setHasNoSotd(true);
        }
      } catch (error) {
        setError(error instanceof Error ? error : new Error(String(error)));

        // Check if it's a connection error
        if (
          error instanceof Error &&
          (error.message.includes("fetch failed") ||
            error.message.includes("network") ||
            error.message.includes("socket"))
        ) {
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [resolvedParams.slug, currentDate]);

  // Determine if we have an SOTD
  const hasSotd = !!sotdData;

  // Extract top genres from top artists
  const topGenres = statistics?.topArtists
    ? Array.from(
        new Set(
          statistics.topArtists
            .flatMap((artist) => artist.genres)
            .filter(Boolean)
        )
      ).slice(0, 3)
    : [];

  // Extract top artist names
  const topArtistNames = statistics?.topArtists
    ? statistics.topArtists.map((artist) => artist.name).slice(0, 3)
    : [];

  // Extract top track names
  const topTrackNames = statistics?.topTracks
    ? statistics.topTracks.map((track) => track.name).slice(0, 3)
    : [];

  // Extract top album names
  const topAlbumNames = statistics?.topAlbums
    ? statistics.topAlbums.map((album) => album.name).slice(0, 3)
    : [];

  // Extract top artist images (use album cover as fallback if no artist image)
  const topArtistImages = statistics?.topArtists
    ? statistics.topArtists
        .map((artist) => {
          // If artist has images, use the first one
          if (artist.images && artist.images.length > 0) {
            return artist.images[0].url;
          }
          // Otherwise, find a track by this artist and use its album cover
          const artistTrack = statistics.topTracks.find((track) =>
            track.artists.some((a) => a.name === artist.name)
          );
          if (artistTrack && artistTrack.album.images.length > 0) {
            return artistTrack.album.images[0].url;
          }
          // Fallback to a default image if no album cover found
          return "/default-album.png";
        })
        .slice(0, 3)
    : [];

  // Extract top album images
  const topAlbumImages = statistics?.topAlbums
    ? statistics.topAlbums
        .map((album) => {
          if (album.images && album.images.length > 0) {
            return album.images[0].url;
          }
          return "/default-album.png";
        })
        .slice(0, 3)
    : [];

  // Extract top track images (album covers)
  const topTrackImages = statistics?.topTracks
    ? statistics.topTracks
        .map((track) => {
          if (track.album.images && track.album.images.length > 0) {
            return track.album.images[0].url;
          }
          return "/default-album.png";
        })
        .slice(0, 3)
    : [];

  // Show loading state while data is loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show error state if profile fetch failed
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 mb-4">
          Unable to load your profile. Please try again later.
        </div>
        <button
          onClick={() => router.push(`/profile/${resolvedParams.slug}`)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 mx-auto my-6 max-w-screen-md">
      <ProfileSection
        username={profile?.name || "Loading..."}
        bio={`just use a hashmap ☝🏼`}
        topGenres={topGenres.length > 0 ? topGenres : ["Pop", "R&B", "Blues"]}
        topArtists={
          topArtistNames.length > 0
            ? topArtistNames
            : ["Fly By Midnight", "Lany", "Benson Boone"]
        }
        photoUrl={profile?.image}
      />
      <div className="flex border-b border-gray-200 text-sm text-gray-500 font-medium tracking-wide">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-center py-3 transition ${
              activeTab === tab
                ? "text-gray-700 border-b-2 border-gray-700"
                : "hover:bg-gray-50 rounded-md"
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>
      {activeTab === "Song of the Day" && (
        <div className="flex flex-col gap-4">
          {hasSotd && sotdData ? (
            <SotdCard
              albumCoverSrc={sotdData.track.album.images[0].url}
              trackName={sotdData.track.name}
              trackAlbumName={sotdData.track.album.name}
              artist={sotdData.track.artists[0].name}
              note={sotdData.note}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {hasNoSotd
                  ? "No Song of the Day selected yet."
                  : "Loading your Song of the Day..."}
              </p>
              <button
                onClick={() =>
                  router.push(`/profile/${resolvedParams.slug}/select-sotd`)
                }
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Select Your Song of the Day
              </button>
            </div>
          )}
        </div>
      )}
      {activeTab === "Spotify Recap" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
          {statistics ? (
            <Recap
              vibe={statistics.vibe || "spending nights collecting memories"}
              totalTracks={statistics.totalTracks}
              totalDuration={statistics.totalDuration}
              uniqueArtists={statistics.uniqueArtists}
              topArtists={topArtistNames}
              topAlbums={topAlbumNames}
              topTracks={topTrackNames}
              topArtistImages={topArtistImages}
              topAlbumImages={topAlbumImages}
              topTrackImages={topTrackImages}
              theme={vibeThemes.orange}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No Spotify statistics available yet.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
