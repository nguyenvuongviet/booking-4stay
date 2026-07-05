"use client";

import Loader from "@/_components/ui/loader";
import { cn } from "@/lib/utils";
import { getCurrentUser, isAdmin } from "@/lib/utils/auth-client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { AdminHeader } from "./_components/Header";
import { AdminSidebar } from "./_components/SideBar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || !isAdmin(user)) {
      router.replace("/auth/login?next=/admin");
      return;
    }
    setReady(true);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed");

    if (saved !== null) {
      setIsCollapsed(saved === "1");
    } else {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
        localStorage.setItem("sidebar_collapsed", "1");
      } else {
        setIsCollapsed(false);
        localStorage.setItem("sidebar_collapsed", "0");
      }
    }

    const handleResize = () => {
      if (window.innerWidth < 1024 && !isCollapsed) {
        setIsCollapsed(true);
        localStorage.setItem("sidebar_collapsed", "1");
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar_collapsed", next ? "1" : "0");
      return next;
    });
  };

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (!ready)
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader />
      </div>
    );

  return (
    <div className="min-h-screen bg-background relative">
      {/* Backdrop overlay for mobile sidebar */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden transition-all duration-300 animate-in fade-in-50"
        />
      )}

      <AdminSidebar
        isCollapsed={isCollapsed}
        onToggle={toggleSidebar}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />
      <div
        className={cn(
          "min-w-0 w-auto overflow-x-clip transition-all duration-300 ml-0",
          isCollapsed ? "md:ml-20" : "md:ml-64",
        )}
      >
        <AdminHeader onMenuToggle={() => setIsMobileOpen(true)} />
        <main className="min-w-0 overflow-x-clip px-4 sm:px-6 pb-6 pt-2">
          {children}
        </main>
      </div>
    </div>
  );
}
