"use client";

import { UserAvatar } from "@/_components/UserAvatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/_components/ui/popover";
import { toast } from "@/_components/ui/use-toast";
import { useAuth } from "@/context/auth-context";
import { useNotifications } from "@/context/notification-context";
import { Bell, Lock, LogOut, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import AdminNotificationList from "./AdminNotificationList";

function AdminNotificationBadge() {
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter(
    (n) =>
      !n.read &&
      (n.type === "ADMIN_BOOKING_CREATED" ||
        n.type === "ADMIN_BOOKING_CANCELLED" ||
        n.type === "ADMIN_BOOKING_WAITING_REFUND" ||
        n.type === "ADMIN_PAYMENT_SUCCESS" ||
        n.type === "ADMIN_CHECKIN_REMINDER"),
  ).length;
  if (!unreadCount) return null;
  return (
    <span className="absolute -top-0 -right-0 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px]">
      {unreadCount > 9 ? "9+" : unreadCount}
    </span>
  );
}

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
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="relative p-2 hover:bg-muted/80 rounded-lg transition-colors cursor-pointer"
              aria-label="Thông báo"
            >
              <Bell className="w-5 h-5 text-foreground" />
              <AdminNotificationBadge />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-96 p-2 bg-card shadow-lg rounded-xl border border-border z-50"
            align="end"
            sideOffset={8}
          >
            <AdminNotificationList />
          </PopoverContent>
        </Popover>

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
            <span className="text-sm font-medium max-w-40 truncate">
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
                  className="w-full flex items-center gap-3 px-2 py-2 text-sm text-red-500 hover:bg-muted rounded-lg transition-colors cursor-pointer"
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
