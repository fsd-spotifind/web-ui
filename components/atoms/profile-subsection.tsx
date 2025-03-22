import { cn } from "@/lib/utils";

type ProfileSubsectionProps = {
  title: string;
  items: string[];
  className?: string;
};

const ProfileSubsection = ({
  title,
  items,
  className,
}: ProfileSubsectionProps) => {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">
        {title}
      </div>
      <div className="text-base font-medium text-gray-700">{items.join(" • ")}</div>
    </div>
  );
};

export { ProfileSubsection };
