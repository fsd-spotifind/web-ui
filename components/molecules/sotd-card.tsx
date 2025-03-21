import { SongCard } from "@/components/molecules/song-card";
import { Blockquote } from "@/components/atoms/block-quote";

export const SotdCard = ({
  albumCoverSrc,
  trackName,
  trackAlbumName,
  artist,
  note,
}: {
  albumCoverSrc: string;
  trackName: string;
  trackAlbumName: string;
  artist: string;
  note: string;
}) => {
  return (
    <div className="flex flex-col md:flex-row items-stretch gap-4 border border-gray-200 rounded-md p-4">
      <div className="flex-1 min-w-0">
        <SongCard
          albumCoverSrc={albumCoverSrc}
          trackName={trackName}
          trackAlbumName={trackAlbumName}
          artist={artist}
        />
      </div>
      <div className="flex-[2] min-w-0">
        <Blockquote>{note}</Blockquote>
      </div>
    </div>
  );
};
