import Image from "next/image";
import { User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  avatarUrl: string | null | undefined;
  fullName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { wrapper: "w-8 h-8", icon: "w-4 h-4" },
  md: { wrapper: "w-10 h-10", icon: "w-5 h-5" },
  lg: { wrapper: "w-12 h-12", icon: "w-6 h-6" },
};

export function UserAvatar({
  avatarUrl,
  fullName,
  size = "lg",
  className,
}: UserAvatarProps) {
  const { wrapper, icon } = sizeMap[size];

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={fullName}
        width={size === "sm" ? 32 : size === "md" ? 40 : 48}
        height={size === "sm" ? 32 : size === "md" ? 40 : 48}
        priority={true}
        className={cn(wrapper, "rounded-full object-cover", className)}
      />
    );
  }

  const fallbackIconClass = className ? "w-14 h-14" : icon;

  return (
    <div
      className={cn(
        wrapper,
        "bg-muted rounded-full flex items-center justify-center",
        className
      )}
    >
      <UserIcon className={cn(fallbackIconClass, "text-muted-foreground")} />
    </div>
  );
}
