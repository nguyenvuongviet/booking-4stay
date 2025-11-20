"use client";

import Loader from "@/components/loader/Loader";
import { getCurrentUser, isAdmin } from "@/lib/utils/auth-client";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { AdminSidebar } from "./_components/SideBar";
import { AdminHeader } from "./_components/Header";

const SIDEBAR_WIDTH = {
  expanded: 256,
  collapsed: 80,
} as const;

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
  }, [router]);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed");

    if (saved !== null) {
      setIsCollapsed(saved === "1");
    } else {
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
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

  const sidebarWidthPx = useMemo(
    () => (isCollapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded),
    [isCollapsed]
  );

  if (!ready)
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader />
      </div>
    );

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
      <div
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: `${sidebarWidthPx}px` }}
      >
        <AdminHeader />
        <main className="px-6 pb-6 pt-2">{children}</main>
      </div>
    </div>
  );
}
