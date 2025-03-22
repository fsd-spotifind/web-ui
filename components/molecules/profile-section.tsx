import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { ProfileSubsection } from "@/components/atoms/profile-subsection";
import { Button } from "@/components/atoms/button";
export const ProfileSection = ({
  username,
  photoUrl,
  bio,
  topGenres,
  topArtists,
}: {
  username: string;
  photoUrl?: string;
  bio: string;
  topGenres: string[];
  topArtists: string[];
}) => {
  const photo = photoUrl || "/profile.png";
  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-4">
        <div className="flex gap-4 items-center">
          <Avatar>
            <AvatarImage src={photo} />
            <AvatarFallback>{username}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-4">
            <div className="text-xl font-bold">{username}</div>
            <div className="flex gap-10">
              <ProfileSubsection title="Top Genres" items={topGenres} />
              <ProfileSubsection title="Top Artists" items={topArtists} />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-gray-500 overflow-hidden text-ellipsis">
            {bio}
          </div>
          <Button variant="outline" className="hover:bg-gray-50">
            Add Friend
          </Button>
        </div>
      </div>
    </div>
  );
};
