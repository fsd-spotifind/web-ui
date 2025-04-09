"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import Image from "next/image";

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
}

export default function SelectSotdPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [recommendedTracks, setRecommendedTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [note, setNote] = useState("");
  const [mood, setMood] = useState("");

  useEffect(() => {
    const fetchRecommendedTracks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log(
          `[DEBUG] Fetching recommended tracks for user: ${resolvedParams.slug}`
        );

        const response = await fetch(
          `/api/user/${resolvedParams.slug}/sotds/recommended`
        );

        console.log(`[DEBUG] Response status: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            "[DEBUG] Error fetching recommended tracks:",
            errorText
          );
          throw new Error("Failed to fetch recommended tracks");
        }

        const data = await response.json();
        console.log(`[DEBUG] Received data:`, data);

        // Handle both formats: { tracks: [...] } or direct array
        let tracks = [];
        if (data.tracks) {
          tracks = data.tracks;
          console.log(
            `[DEBUG] Using tracks from data.tracks: ${tracks.length}`
          );
        } else if (Array.isArray(data)) {
          tracks = data;
          console.log(
            `[DEBUG] Using data directly as tracks array: ${tracks.length}`
          );
        } else {
          console.log(`[DEBUG] No tracks found in response data`);
        }

        if (tracks.length > 0) {
          console.log(`[DEBUG] First track:`, tracks[0]);
        }

        setRecommendedTracks(tracks);
      } catch (err) {
        console.error("[DEBUG] Error in fetchRecommendedTracks:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendedTracks();
  }, [resolvedParams.slug]);

  const handleSubmit = async () => {
    if (!selectedTrack) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // Format the request body according to the API endpoint requirements
      const requestBody = {
        track_id: selectedTrack.id,
        note: note || "",
        mood: mood || "",
      };

      console.log("[DEBUG] Submitting SOTD with data:", requestBody);

      const response = await fetch(`/api/user/${resolvedParams.slug}/sotds`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error submitting SOTD:", errorText);
        throw new Error("Failed to submit SOTD");
      }

      router.push(`/profile/${resolvedParams.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit SOTD");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => router.push(`/profile/${resolvedParams.slug}`)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Profile
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Select Your Song of the Day</h1>

      {recommendedTracks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">
            No recommended songs available at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedTracks.map((track) => (
            <div
              key={track.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedTrack?.id === track.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => setSelectedTrack(track)}
            >
              <div className="flex items-center space-x-4">
                {track.album.images[0] && (
                  <Image
                    src={track.album.images[0].url}
                    alt={track.album.name}
                    width={64}
                    height={64}
                    className="rounded"
                  />
                )}
                <div>
                  <h3 className="font-semibold">{track.name}</h3>
                  <p className="text-sm text-gray-600">
                    {track.artists[0].name}
                  </p>
                  <p className="text-xs text-gray-500">{track.album.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTrack && (
        <div className="mt-8 p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Add a Note</h2>
          <div className="mb-4">
            <label
              htmlFor="note"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Why is this your Song of the Day?
            </label>
            <textarea
              id="note"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Share your thoughts about this song..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            ></textarea>
          </div>

          <div className="mb-4">
            <label
              htmlFor="mood"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              What&apos;s your mood today?
            </label>
            <input
              id="mood"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Happy, Melancholic, Energetic"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={!selectedTrack || isSubmitting}
          className={`px-6 py-3 rounded-lg font-semibold ${
            !selectedTrack || isSubmitting
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {isSubmitting ? "Submitting..." : "Submit SOTD"}
        </button>
      </div>
    </div>
  );
}
