"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import { STORAGE_KEYS } from "@/constants";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Calendar,
  ChevronLeft,
  DoorOpen,
  Gift,
  Home,
  LayoutDashboard,
  LogOut,
  MapPin,
  Settings,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const menuItems = [
  { icon: LayoutDashboard, label: "Tổng quan", href: "/admin" },
  { icon: Users, label: "Người dùng", href: "/admin/users" },
  // { icon: Home, label: "Homestay", href: "/admin/properties" },
  { icon: DoorOpen, label: "Phòng", href: "/admin/rooms" },
  { icon: Calendar, label: "Đặt phòng", href: "/admin/bookings" },
  { icon: Star, label: "Bình luận & Đánh giá", href: "/admin/reviews" },
  { icon: Gift, label: "Khách hàng Thân thiết", href: "/admin/loyalty" },
  { icon: MapPin, label: "Vị trí", href: "/admin/locations" },
  // { icon: BarChart3, label: "Báo cáo & Thống kê", href: "/admin/reports" },
  // { icon: TrendingUp, label: "Doanh thu", href: "/admin/revenue" },
  { icon: Settings, label: "Cài đặt", href: "/admin/settings" },
];

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ isCollapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    toast({
      title: "Đăng xuất thành công",
      description: "Hẹn gặp lại bạn 👋",
      variant: "success",
    });
    router.push("/auth/login");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <button
        onClick={onToggle}
        className={cn(
          "absolute -right-3 top-1/3 p-1 rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-md transition-colors hover:bg-sidebar-accent z-50 cursor-pointer",
          isCollapsed ? "rotate-180" : ""
        )}
      >
        <ChevronLeft className="w-4 h-4 transition-transform duration-300" />
      </button>

      <div className="h-20 px-4 border-b border-sidebar-border flex items-center transition-all duration-300 justify-center mb-2">
        <Link href="/admin" className="flex items-center gap-3">
          <Image
            src="/4stay-logo.png"
            alt="4Stay"
            width={50}
            height={50}
            className="rounded-md"
            priority
          />
          {!isCollapsed && (
            <span className="text-2xl font-bold tracking-tight whitespace-nowrap">
              4Stay Admin
            </span>
          )}
        </Link>
      </div>

      <TooltipProvider>
        <nav className="flex-1 overflow-y-auto p-1 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent",
                  isCollapsed ? "justify-center" : "justify-start"
                )}
              >
                <Icon className="w-5 h-5" />
                {!isCollapsed && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </nav>

        <div className="border-t border-sidebar-border">
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors cursor-pointer",
                    "justify-center"
                  )}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors cursor-pointer",
                "justify-start"
              )}
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium whitespace-nowrap">
                Logout
              </span>
            </button>
          )}
        </div>
      </TooltipProvider>
    </aside>
  );
}
