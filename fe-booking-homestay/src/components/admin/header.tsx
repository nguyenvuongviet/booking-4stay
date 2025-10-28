"use client";

import { Bell, Lock, LogOut, Settings, User } from "lucide-react";
import { useState } from "react";

export function AdminHeader() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="fixed top-0 right-0 left-64 h-20 bg-card border-b border-border flex items-center justify-end px-6 z-40">
      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium">Admin</span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-border">
                <p className="text-sm font-semibold">Admin User</p>
                <p className="text-xs text-muted-foreground">admin@4stay.com</p>
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
