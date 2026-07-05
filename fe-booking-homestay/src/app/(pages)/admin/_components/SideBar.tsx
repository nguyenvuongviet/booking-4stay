"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/_components/ui/tooltip";
import { toast } from "@/_components/ui/use-toast";
import { STORAGE_KEYS } from "@/constants";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import {
  Calendar,
  ChevronLeft,
  DoorOpen,
  FileText,
  Gift,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquare,
  Plus,
  Settings,
  Star,
  Ticket,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const menuGroups = [
  {
    groupLabel: "Tổng quan",
    items: [{ icon: LayoutDashboard, label: "Tổng quan", href: "/admin" }],
  },
  {
    groupLabel: "Kinh doanh",
    items: [
      { icon: Calendar, label: "Đặt phòng", href: "/admin/bookings" },
      { icon: DoorOpen, label: "Phòng", href: "/admin/rooms" },
    ],
  },
  {
    groupLabel: "Khách hàng & Hỗ trợ",
    items: [
      { icon: Users, label: "Người dùng", href: "/admin/users" },
      { icon: MessageSquare, label: "Chat", href: "/admin/chat" },
      { icon: Star, label: "Bình luận & Đánh giá", href: "/admin/reviews" },
    ],
  },
  {
    groupLabel: "Chiến dịch & Bài viết",
    items: [
      { icon: Ticket, label: "Mã giảm giá", href: "/admin/promotions" },
      { icon: Gift, label: "Khách hàng Thân thiết", href: "/admin/loyalty" },
      { icon: FileText, label: "Blog", href: "/admin/blog" },
    ],
  },
  {
    groupLabel: "Hệ thống",
    items: [
      { icon: MapPin, label: "Vị trí", href: "/admin/locations" },
      { icon: Settings, label: "Cài đặt", href: "/admin/settings" },
    ],
  },
];

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function AdminSidebar({
  isCollapsed,
  onToggle,
  isMobileOpen,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { setUser } = useAuth();

  useEffect(() => {
    onMobileClose();
  }, [pathname]);

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
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-50",
        // Desktop widths
        isCollapsed ? "md:w-20" : "md:w-64",
        // Mobile layout: overlay drawer, defaults to w-52 below sm, w-64 from sm, translates off screen, slides in on open
        "w-52 sm:w-64 -translate-x-full md:translate-x-0",
        isMobileOpen ? "translate-x-0 shadow-2xl" : "",
      )}
    >
      <button
        onClick={onToggle}
        className={cn(
          "absolute -right-3 top-1/2 p-1 rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-md transition-colors hover:bg-sidebar-accent z-50 cursor-pointer hidden md:block",
          isCollapsed ? "rotate-180" : "",
        )}
      >
        <ChevronLeft className="w-4 h-4 transition-transform duration-300" />
      </button>

      <div className="h-16 sm:h-20 px-4 border-b border-sidebar-border flex items-center transition-all duration-300 justify-center mb-2 shrink-0">
        <Link href="/admin" className="flex items-center gap-3">
          <Image
            src="/4stay-logo.png"
            alt="4Stay"
            width={40}
            height={40}
            className="rounded-md sm:w-12.5 sm:h-12.5"
            priority
          />
          <span
            className={cn(
              "text-lg sm:text-2xl font-bold tracking-tight whitespace-nowrap",
              isCollapsed ? "md:hidden" : "block",
            )}
          >
            4Stay Admin
          </span>
        </Link>
      </div>

      <TooltipProvider>
        <div className="px-3 sm:px-4 py-2 border-b border-sidebar-border mb-2 shrink-0">
          <Link
            href="/admin/offline-booking"
            className={cn(
              "flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground p-2.5 sm:px-4 sm:py-3 rounded-lg font-bold transition-all shadow-sm active:scale-[0.98]",
              isCollapsed ? "md:p-3" : "",
            )}
          >
            <Plus className="w-5 h-5 shrink-0" />
            <span
              className={cn(
                "text-xs sm:text-sm truncate",
                isCollapsed ? "md:hidden" : "block",
              )}
            >
              Đặt phòng nhanh
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-1 space-y-4">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {groupIdx > 0 && (
                <div className="border-t border-sidebar-border/60 my-4 mx-2 opacity-50" />
              )}
              <div
                className={cn(
                  "px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400/80 dark:text-slate-500/80 select-none",
                  isCollapsed ? "md:hidden" : "block",
                )}
              >
                {group.groupLabel}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  const linkContent = (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 sm:py-3 rounded-lg transition-colors",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent",
                        isCollapsed ? "md:justify-center" : "justify-start",
                      )}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span
                        className={cn(
                          "text-xs sm:text-sm font-medium truncate",
                          isCollapsed ? "md:hidden" : "block",
                        )}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );

                  if (isCollapsed) {
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="hidden md:block"
                        >
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return linkContent;
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-2 shrink-0">
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 p-2.5 sm:px-4 sm:py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors cursor-pointer",
              isCollapsed ? "md:justify-center" : "justify-start",
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span
              className={cn(
                "text-xs sm:text-sm font-medium truncate",
                isCollapsed ? "md:hidden" : "block",
              )}
            >
              Đăng xuất
            </span>
          </button>
        </div>
      </TooltipProvider>
    </aside>
  );
}
