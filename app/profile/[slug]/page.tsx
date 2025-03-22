import { SotdCard } from "@/components/molecules/sotd-card";
import { default as track01 } from "@/data/mock/tracks/01.json";

export default function Profile() {
  return (
    <div className="flex flex-col gap-4 mx-8 my-6">
      <div className="text-2xl font-bold">Song of the Day</div>
      <SotdCard
        albumCoverSrc={track01.album.images[0].url}
        trackName={track01.name}
        trackAlbumName={track01.album.name}
        artist={track01.artists[0].name}
        note="but love isn’t meant to be a funeral, nor devotion a blade to the throat. Still, you whisper it like a promise"
      />
    </div>
  );
}
