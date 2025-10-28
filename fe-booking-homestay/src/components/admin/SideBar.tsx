"use client";

import { cn } from "@/lib/utils";
import {
  BarChart3,
  Calendar,
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
import { usePathname } from "next/navigation";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Home, label: "Quản lý homestay", href: "/admin/properties" },
  { icon: DoorOpen, label: "Rooms", href: "/admin/rooms" },
  { icon: Calendar, label: "Bookings", href: "/admin/bookings" },
  { icon: Star, label: "Reviews", href: "/admin/reviews" },
  { icon: Gift, label: "Loyalty", href: "/admin/loyalty" },
  { icon: MapPin, label: "Locations", href: "/admin/locations" },
  { icon: BarChart3, label: "Báo cáo & Thống kê", href: "/admin/reports" },
  { icon: TrendingUp, label: "Revenue", href: "/admin/revenue" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="h-20 px-4 border-b border-sidebar-border flex items-center">
        <Link href="/admin" className="flex items-center gap-3">
          <Image
            src="/4stay-logo.png"
            alt="4Stay"
            width={45}
            height={45}
            className="rounded-md"
            priority
          />
          <span className="text-xl font-bold tracking-tight">4Stay Admin</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
