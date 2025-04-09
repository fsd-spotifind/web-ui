"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { SotdCard } from "@/components/molecules/sotd-card";
import { ProfileSection } from "@/components/molecules/profile-section";
import { Recap } from "@/components/molecules/recap";
import { vibeThemes } from "@/constants/recap-theme";
import { default as track01 } from "@/data/mock/tracks/01.json";
import { default as track02 } from "@/data/mock/tracks/02.json";
import { default as track03 } from "@/data/mock/tracks/03.json";

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
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isSotdLoading, setIsSotdLoading] = useState(true);
  const [profileError, setProfileError] = useState<Error | null>(null);
  const [sotdError, setSotdError] = useState<Error | null>(null);
  const [hasNoSotd, setHasNoSotd] = useState(false);
  const [isConnectionError, setIsConnectionError] = useState(false);

  // Get current date in YYYY-MM-DD format using UTC
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const currentDate = new Date(date.getTime() - offset * 60 * 1000)
    .toISOString()
    .split("T")[0];
  console.log("Current UTC date:", currentDate);
  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsProfileLoading(true);
        console.log("Fetching profile for:", resolvedParams.slug);
        const response = await fetch(`/api/user/${resolvedParams.slug}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${await response.text()}`);
        }

        const data = await response.json();
        setProfile(data);
        setProfileError(null);
      } catch (error) {
        console.error("Profile fetch error:", error);
        setProfileError(
          error instanceof Error ? error : new Error(String(error))
        );
      } finally {
        setIsProfileLoading(false);
      }
    };

    fetchProfile();
  }, [resolvedParams.slug]);

  // Fetch SOTD data
  useEffect(() => {
    const fetchSotd = async () => {
      // Only fetch SOTD if we have a profile
      if (!profile) return;

      try {
        setIsSotdLoading(true);
        setHasNoSotd(false);
        setIsConnectionError(false);
        console.log("Fetching SOTDs for:", resolvedParams.slug);

        // Use a timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`/api/user/${resolvedParams.slug}/sotds`, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 404) {
            console.log("SOTD not found - this is a valid state");
            setSotdData(null);
            setSotdError(null);
            setHasNoSotd(true);
            return;
          }
          throw new Error(`Failed to fetch SOTD: ${await response.text()}`);
        }

        const data = await response.json();
        console.log("SOTDs data:", data);

        // Check if there's an entry for today's date
        if (
          data.entries &&
          data.entries[currentDate] &&
          data.entries[currentDate].length > 0
        ) {
          // Get the first SOTD for today
          const todaySotd = data.entries[currentDate][0];
          console.log("Found SOTD for today:", todaySotd);
          setSotdData(todaySotd);
          setSotdError(null);
          setHasNoSotd(false);
        } else {
          console.log("No SOTD found for today");
          setSotdData(null);
          setSotdError(null);
          setHasNoSotd(true);
        }
      } catch (error) {
        console.error("SOTD fetch error:", error);

        // Check if it's a connection error
        if (
          error instanceof Error &&
          (error.message.includes("fetch failed") ||
            error.message.includes("network") ||
            error.message.includes("socket") ||
            error.message.includes("abort"))
        ) {
          console.log("Connection error detected");
          setIsConnectionError(true);
          setSotdError(
            new Error(
              "Connection to the server failed. Please try again later."
            )
          );
        } else {
          // For other errors, treat as if no SOTD is selected
          console.log("Other error detected - treating as no SOTD selected");
          setSotdData(null);
          setSotdError(null);
          setHasNoSotd(true);
        }
      } finally {
        setIsSotdLoading(false);
      }
    };

    fetchSotd();
  }, [resolvedParams.slug, currentDate, profile]);

  // Determine if we have an SOTD
  const hasSotd = !!sotdData;

  // Show loading state while either profile or SOTD is loading
  if (isProfileLoading || isSotdLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show error state if profile fetch failed
  if (profileError) {
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
        bio={`hi`}
        topGenres={["Pop", "R&B", "Blues"]}
        topArtists={["Fly By Midnight", "Lany", "Benson Boone"]}
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
          {sotdError ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">
                {isConnectionError
                  ? "Connection to the server failed. The Song of the Day service might be temporarily unavailable."
                  : "Unable to load your Song of the Day. Please try again later."}
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => router.push(`/profile/${resolvedParams.slug}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Retry
                </button>
                <button
                  onClick={() =>
                    router.push(`/profile/${resolvedParams.slug}/select-sotd`)
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  Select Your Song of the Day
                </button>
              </div>
            </div>
          ) : hasSotd && sotdData ? (
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
          <Recap
            vibe="spending nights collecting memories"
            totalTracks={286}
            totalDuration={997}
            uniqueArtists={76}
            topArtists={[
              track01.artists[0].name,
              track02.artists[0].name,
              track03.artists[0].name,
            ]}
            topAlbums={[
              track01.album.name,
              track02.album.name,
              track03.album.name,
            ]}
            topTracks={[track01.name, track02.name, track03.name]}
            theme={vibeThemes.orange}
          />
        </div>
      )}
    </div>
  );
}
