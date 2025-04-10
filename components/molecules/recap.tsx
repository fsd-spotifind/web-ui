"use client";

import { useState } from "react";
import { MusicNoteIcon } from "@/icons/music-note";
import { vibeThemes } from "@/constants/recap-theme";
import Image from "next/image";

const TABS = ["artists", "albums", "tracks"] as const;
type Theme = (typeof vibeThemes)[keyof typeof vibeThemes];

export const Recap = ({
  totalTracks,
  totalDuration,
  uniqueArtists,
  vibe,
  topArtists,
  topAlbums,
  topTracks,
  topArtistImages = [],
  topAlbumImages = [],
  topTrackImages = [],
  theme,
}: {
  totalTracks: number;
  totalDuration: number;
  uniqueArtists: number;
  vibe: string;
  topArtists: string[];
  topAlbums: string[];
  topTracks: string[];
  topArtistImages?: string[];
  topAlbumImages?: string[];
  topTrackImages?: string[];
  theme?: Theme;
}) => {
  const [selectedTab, setSelectedTab] =
    useState<(typeof TABS)[number]>("artists");
  const colors = theme ?? vibeThemes.orange;

  const getItems = () => {
    switch (selectedTab) {
      case "artists":
        return topArtists;
      case "albums":
        return topAlbums;
      case "tracks":
        return topTracks;
    }
  };

  const getImages = () => {
    switch (selectedTab) {
      case "artists":
        return topArtistImages;
      case "albums":
        return topAlbumImages;
      case "tracks":
        return topTrackImages;
    }
  };

  return (
    <div
      className={`max-w-md mx-auto p-6 font-semibold rounded-xl shadow ${colors.bg} ${colors.text}`}
    >
      <div
        className={`flex items-center gap-2 text-sm uppercase ${colors.accent} mb-1`}
      >
        <MusicNoteIcon />
        <span>recap</span>
      </div>

      <div className="text-xl font-bold mb-4">{vibe}</div>

      <div className="grid grid-cols-3 gap-4 text-center mb-4">
        <div className="flex flex-col items-start">
          <div className={`text-sm ${colors.statLabel}`}>total tracks</div>
          <div className="text-lg font-bold">
            {totalTracks}{" "}
            <span className={`text-sm ${colors.text}`}>songs</span>
          </div>
        </div>
        <div className="flex flex-col items-start">
          <div className={`text-sm ${colors.statLabel}`}>total duration</div>
          <div className="text-lg font-bold">
            {totalDuration}{" "}
            <span className={`text-sm ${colors.text}`}>mins</span>
          </div>
        </div>
        <div className="flex flex-col items-start">
          <div className={`text-sm ${colors.statLabel}`}>unique artists</div>
          <div className="text-lg font-bold">
            {uniqueArtists}{" "}
            <span className={`text-sm ${colors.text}`}>artists</span>
          </div>
        </div>
      </div>

      <div className={`flex ${colors.tabBg} rounded-full p-1 mb-6`}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`flex-1 py-2 text-sm rounded-full transition ${
              selectedTab === tab ? colors.tabActive : "hover:opacity-80"
            }`}
          >
            top {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {getItems().map((item, idx) => {
          const images = getImages();
          const imageUrl = images[idx] || "/default-album.png";

          return (
            <div key={idx} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-md overflow-hidden relative">
                <Image
                  src={imageUrl}
                  alt={item}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="text-sm font-medium">{item}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
