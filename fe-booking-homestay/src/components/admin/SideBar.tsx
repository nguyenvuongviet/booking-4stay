"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";

import {
  Home,
  BarChart3,
  BedDouble,
  CalendarCheck,
  Menu,
  ChevronLeft,
  LogOut,
} from "lucide-react";

interface SideBarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function SideBar({ isOpen, onToggle }: SideBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { openSignIn, user, logout } = useAuth();

  const menuItems = [
    { name: "Trang chủ", path: "/admin/home", icon: <Home size={20} /> },
    {
      name: "Thống kê",
      path: "/admin/statistics",
      icon: <BarChart3 size={20} />,
    },
    {
      name: "Quản lý phòng",
      path: "/admin/rooms",
      icon: <BedDouble size={20} />,
    },
    {
      name: "Quản lý đặt phòng",
      path: "/admin/bookings",
      icon: <CalendarCheck size={20} />,
    },
  ];

  const handleSignIn = () => {
    router.push("/admin/login");
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-white border-r shadow-sm flex flex-col transition-all duration-300 z-40
        ${isOpen ? "w-56" : "w-16"}
        md:translate-x-0 
        ${!isOpen ? "overflow-hidden" : ""}
      `}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {isOpen && <img className="w-28" src="/4stay-logo.png" alt="logo" />}
        <button onClick={onToggle} className="p-2 rounded-lg hover:bg-gray-100">
          {isOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="flex-1 p-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition
              ${
                pathname === item.path
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-gray-700"
              }`}
          >
            {item.icon}
            {isOpen && <span>{item.name}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t text-sm text-gray-500">
        {user ? (
          <div
            className={`flex items-center ${
              isOpen ? "justify-between" : "justify-center"
            }`}
          >
            <div
              className={`flex items-center ${
                isOpen ? "" : "flex-col space-y-2 justify-center"
              }`}
            >
              <img
                src={user?.avatar || "/default-avatar.jpg"}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
              {isOpen && (
                <span className="ml-3 whitespace-nowrap">
                  {user.firstName + " " + user.lastName}
                </span>
              )}
            </div>

            <button
              onClick={logout}
              className="flex items-center justify-center p-2 rounded-lg text-red-500 hover:bg-red-50"
            >
              {isOpen ? <LogOut size={20} /> : ""}
            </button> 
          </div>
        ) : (
          <div className="flex justify-center">
            {isOpen && (
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2 elegant-subheading rounded-2xl"
                onClick={handleSignIn}
              >
                Sign in
              </Button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
