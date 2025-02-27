import { SotdCard } from "@/components/molecules/sotd-card";
import { default as track01 } from "@/data/mock/tracks/01.json";
import { default as track02 } from "@/data/mock/tracks/02.json";
import { default as track03 } from "@/data/mock/tracks/03.json";
import { default as track04 } from "@/data/mock/tracks/04.json";

export default function Home() {
  const tracks = [track01, track02, track03, track04];

  return (
    <div className="flex flex-col gap-4 mx-8 my-6">
      {tracks.map((track) => (
        <SotdCard
          key={track.id}
          albumCoverSrc={track.album.images[0].url}
          trackName={track.name}
          trackAlbumName={track.album.name}
          artist={track.artists
            .map((artist: { name: string }) => artist.name)
            .join(", ")}
        />
      ))}
    </div>
  );
}
