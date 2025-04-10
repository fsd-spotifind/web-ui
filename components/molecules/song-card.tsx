import Image from "next/image";

import { AspectRatio } from "@/components/atoms/aspect-ratio";

export const SongCard = ({
  albumCoverSrc,
  trackName,
  trackAlbumName,
  artist,
}: {
  albumCoverSrc: string;
  trackName: string;
  trackAlbumName: string;
  artist: string;
}) => {
  return (
    <div className="flex gap-4 items-center">
      <div className="w-[96px]">
        <AspectRatio ratio={1}>
          <Image
            fill
            // API: https://developer.spotify.com/documentation/web-api/reference/get-track
            // from `album.images[0].url`
            src={albumCoverSrc}
            alt="album cover"
            className="object-cover rounded"
          />
        </AspectRatio>
      </div>

      <div className="flex-1">
        <h2 className="text-lg font-bold">{trackName}</h2>
        <p className="text-xs text-gray-500 uppercase tracking-wide">
          {trackAlbumName}
        </p>
        <p className="text-xs text-gray-700">{artist}</p>
      </div>
    </div>
  );
};
