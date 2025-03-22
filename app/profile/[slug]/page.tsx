"use client";

import { useState } from "react";
import { SotdCard } from "@/components/molecules/sotd-card";
import { ProfileSection } from "@/components/molecules/profile-section";
import { Recap } from "@/components/molecules/recap";
import { vibeThemes } from "@/constants/recap-theme";
import { default as track01 } from "@/data/mock/tracks/01.json";
import { default as track02 } from "@/data/mock/tracks/02.json";
import { default as track03 } from "@/data/mock/tracks/03.json";

const TABS = ["Song of the Day", "Spotify Recap"];

export default function Profile() {
  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]>("Song of the Day");

  return (
    <div className="flex flex-col gap-6 mx-auto my-6 max-w-screen-md">
      <ProfileSection
        username="John Doe"
        bio="I'm a software engineer and a music lover."
        topGenres={["Pop", "R&B", "Blues"]}
        topArtists={["Fly By Midnight", "Lany", "Benson Boone"]}
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
          <SotdCard
            albumCoverSrc={track01.album.images[0].url}
            trackName={track01.name}
            trackAlbumName={track01.album.name}
            artist={track01.artists[0].name}
            note="but love isn’t meant to be a funeral, nor devotion a blade to the throat. Still, you whisper it like a promise"
          />
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
