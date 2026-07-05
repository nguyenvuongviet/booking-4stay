"use client";

import { UserAvatar } from "@/_components/UserAvatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/_components/ui/popover";
import { toast } from "@/_components/ui/use-toast";
import { STORAGE_KEYS } from "@/constants";
import { useAuth } from "@/context/auth-context";
import { useNotifications } from "@/context/notification-context";
import { Bell, Lock, LogOut, Menu, Settings, User } from "lucide-react";
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
    <span className="absolute -top-0.5 -right-0.5 sm:top-0 sm:right-0 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-sans font-semibold leading-none shadow-sm">
      {unreadCount > 9 ? "9+" : unreadCount}
    </span>
  );
}

interface AdminHeaderProps {
  onMenuToggle: () => void;
}

export function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const router = useRouter();
  const { user, setUser } = useAuth();
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

  const shortName = useMemo(() => {
    if (!user) return "Admin";
    const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
    if (!name) return "Admin";
    const parts = name.split(/\s+/);
    return parts[parts.length - 1] || "Admin";
  }, [user]);

  const email = user?.email ?? "admin@4stay.com";

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    setUser(null);
    toast({
      title: "Đăng xuất thành công",
      description: "Hẹn gặp lại bạn 👋",
      variant: "success",
    });
    window.location.href = "/auth/login";
  };

  return (
    <header className="h-16 sm:h-20 bg-card border-b border-border flex items-center justify-between md:justify-end px-4 sm:px-6 z-40 sticky top-0">
      <button
        onClick={onMenuToggle}
        className="md:hidden p-2 text-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-colors cursor-pointer"
        aria-label="Mở menu"
      >
        <Menu className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
      </button>

      <div className="flex items-center gap-2 sm:gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="relative w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center border border-border/80 hover:bg-primary/10 hover:border-primary/30 text-foreground hover:text-primary data-[state=open]:border-primary data-[state=open]:bg-primary/5 data-[state=open]:text-primary rounded-full transition-all cursor-pointer bg-card/50"
              aria-label="Thông báo"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <AdminNotificationBadge />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[calc(100vw-32px)] sm:w-96 p-2 bg-card shadow-lg rounded-xl border border-border z-50"
            align="end"
            sideOffset={8}
            collisionPadding={16}
          >
            <AdminNotificationList />
          </PopoverContent>
        </Popover>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowProfileMenu((s) => !s)}
            className={`flex items-center gap-1 sm:gap-1.5 pl-1 sm:pl-1.5 pr-2.5 sm:pr-4 h-9 sm:h-11 border rounded-full transition-all cursor-pointer ${
              showProfileMenu
                ? "border-primary bg-primary/5 text-primary"
                : "border-border/80 hover:bg-primary/10 hover:border-primary/30 hover:text-primary text-slate-700 dark:text-slate-200"
            }`}
            aria-haspopup="menu"
            aria-expanded={showProfileMenu}
          >
            <UserAvatar
              avatarUrl={user?.avatar}
              fullName={displayName}
              size="sm"
              className="w-7 h-7 sm:w-9 sm:h-9"
            />
            <span className="text-xs sm:text-sm font-semibold px-1 sm:px-1.5 text-foreground truncate max-w-20 sm:max-w-36">
              {user?.firstName || "Admin"}
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
                  onClick={() => {
                    router.push("/admin/settings?tab=account");
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-150 cursor-pointer text-slate-700 dark:text-slate-200"
                >
                  <User className="w-4 h-4" />
                  <span>Hồ sơ</span>
                </button>
                <button
                  onClick={() => {
                    router.push("/admin/settings?tab=security");
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-150 cursor-pointer text-slate-700 dark:text-slate-200"
                >
                  <Lock className="w-4 h-4" />
                  <span>Đổi mật khẩu</span>
                </button>
                <button
                  onClick={() => {
                    router.push("/admin/settings?tab=system");
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-150 cursor-pointer text-slate-700 dark:text-slate-200"
                >
                  <Settings className="w-4 h-4" />
                  <span>Cài đặt</span>
                </button>
              </div>

              <div className="p-1.5 border-t border-border">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all duration-150 cursor-pointer"
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
