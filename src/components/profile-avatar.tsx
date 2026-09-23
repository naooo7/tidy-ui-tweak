import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type ProfileAvatarProps = {
  displayName?: string;
  avatarUrl?: string | null;
  className?: string;
  fallbackClassName?: string;
};

export function getProfileInitials(displayName?: string) {
  const parts = displayName?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0 || displayName === "Your Profile") return "FL";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "FL";
}

export function ProfileAvatar({ displayName, avatarUrl, className, fallbackClassName }: ProfileAvatarProps) {
  return (
    <Avatar className={className}>
      {avatarUrl ? <AvatarImage src={avatarUrl} alt={`${displayName || "Profile"} avatar`} className="object-cover" /> : null}
      <AvatarFallback className={cn("bg-foreground font-display font-bold text-primary-foreground", fallbackClassName)}>
        {getProfileInitials(displayName)}
      </AvatarFallback>
    </Avatar>
  );
}