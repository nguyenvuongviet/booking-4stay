"use client";

import { Bell, Lock, LogOut, Settings, User } from "lucide-react";
import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { UserAvatar } from "@/components/UserAvatar";
import { toast } from "@/components/ui/use-toast";

export function AdminHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileMenu]);

  const displayName = useMemo(() => {
    if (!user) return "Admin";
    const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
    return name || user.email || "Admin";
  }, [user]);

  const email = user?.email ?? "admin@4stay.com";

  const handleLogout = () => {
    logout();
    toast({
      title: "Đăng xuất thành công",
      description: "Hẹn gặp lại bạn 👋",
      variant: "success",
    });
    router.push("/auth/login");
  };

  return (
    <header className="h-20 bg-card border-b border-border flex items-center justify-end px-6 z-40">
      <div className="flex items-center gap-4">
        <button
          className="relative p-2 hover:bg-muted/80 rounded-lg transition-colors cursor-pointer"
          aria-label="Thông báo"
        >
          <Bell className="w-5 h-5 text-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowProfileMenu((s) => !s)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-muted/80 rounded-xl transition-colors cursor-pointer"
            aria-haspopup="menu"
            aria-expanded={showProfileMenu}
          >
            <UserAvatar
              avatarUrl={user?.avatar}
              fullName={displayName}
              size="md"
            />
            <span className="text-sm font-medium max-w-[160px] truncate">
              {displayName}
            </span>
          </button>

          {showProfileMenu && (
            <div
              className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50"
              role="menu"
            >
              <div className="px-3.5 py-3 border-b border-border">
                <p className="text-sm font-semibold truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {email}
                </p>
              </div>

              <div className="p-1.5 space-y-1">
                <button
                  // onClick={() => router.push(`/admin/users/${user?.id}`)}
                  className="w-full flex items-center gap-3 px-2 py-2 text-sm hover:bg-muted rounded-lg transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>Hồ sơ</span>
                </button>
                <button
                  // onClick={() => router.push("/admin/change-password")}
                  className="w-full flex items-center gap-3 px-2 py-2 text-sm hover:bg-muted rounded-lg transition-colors cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Đổi mật khẩu</span>
                </button>
                <button
                  // onClick={() => router.push("/admin/settings")}
                  className="w-full flex items-center gap-3 px-2 py-2 text-sm hover:bg-muted rounded-lg transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                  <span>Cài đặt</span>
                </button>
              </div>

              <div className="p-1.5 border-t border-border">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-2 py-2 text-sm text-destructive hover:bg-muted rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
