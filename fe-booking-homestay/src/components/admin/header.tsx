"use client";

import Image from "next/image";
import { Bell, Lock, LogOut, Settings, User } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { STORAGE_KEYS } from "@/constants";

type Role = "USER" | "ADMIN" | "HOST" | string;

type CurrentUser = {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  roles?: Role[];
};

function getInitials(name?: string | null, email?: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");
  }
  if (email) return email[0]?.toUpperCase() ?? "U";
  return "U";
}

export function AdminHeader() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (raw) {
        const parsed = JSON.parse(raw);
        const u: CurrentUser | undefined = parsed?.user;
        if (u) setUser(u);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileMenu]);

  const displayName = useMemo(() => {
    if (!user) return "Admin";
    const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
    return name || user.email || "Admin";
  }, [user]);

  const email = user?.email ?? "admin@4stay.com";

  const avatarEl = user?.avatar ? (
    <Image
      src={user.avatar}
      alt={displayName}
      width={40}
      height={40}
      className="w-10 h-10 rounded-full object-cover"
    />
  ) : (
    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
      <span className="text-xs font-semibold text-primary-foreground">
        {getInitials(displayName, email)}
      </span>
    </div>
  );

  return (
    <header className="h-20 bg-card border-b border-border flex items-center justify-end px-6 z-40">
      <div className="flex items-center gap-4">
        <button
          className="relative p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label="Thông báo"
        >
          <Bell className="w-5 h-5 text-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowProfileMenu((s) => !s)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-lg transition-colors"
            aria-haspopup="menu"
            aria-expanded={showProfileMenu}
          >
            {avatarEl}
            <span className="text-sm font-medium max-w-[160px] truncate">
              {displayName}
            </span>
          </button>

          {showProfileMenu && (
            <div
              className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50"
              role="menu"
            >
              <div className="p-4 border-b border-border">
                <p className="text-sm font-semibold truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {email}
                </p>
              </div>

              <div className="p-2 space-y-1">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted rounded-lg transition-colors">
                  <User className="w-4 h-4" />
                  <span>Hồ sơ</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted rounded-lg transition-colors">
                  <Lock className="w-4 h-4" />
                  <span>Đổi mật khẩu</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted rounded-lg transition-colors">
                  <Settings className="w-4 h-4" />
                  <span>Cài đặt</span>
                </button>
              </div>

              <div className="p-2 border-t border-border">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-muted rounded-lg transition-colors">
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
