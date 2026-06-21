"use client";

import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { useNotifications } from "@/context/notification-context";
import { motion } from "framer-motion";
import {
  Bell,
  CalendarDays,
  KeyRound,
  LogOut,
  Menu,
  User as UserIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import NotificationList from "./NotificationList";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { UserAvatar } from "./UserAvatar";

function NotificationBadge() {
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter(
    (n) =>
      !n.read &&
      !String(n.type).startsWith("ADMIN_") &&
      n.type !== "NEW_MESSAGE",
  ).length;
  if (!unreadCount) return null;
  return (
    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px]">
      {unreadCount > 9 ? "9+" : unreadCount}
    </span>
  );
}

export default function Header() {
  const { openSignIn, openNewPassword, user, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { t } = useLang();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        isScrolled
          ? "py-2 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-white/20 shadow-lg"
          : "py-4 bg-transparent"
      }`}
    >
      <div
        className={`max-w-7xl mx-auto transition-all duration-500 ${pathname === "/room" && isScrolled ? "px-4 sm:px-6 lg:px-8" : "px-6 lg:px-8"}`}
      >
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-110">
                <Image
                  src="/4stay-logo.png"
                  alt="Logo"
                  fill
                  sizes="40px"
                  className="object-contain"
                  priority
                />
              </div>
              <span
                className={`elegant-heading text-2xl tracking-tighter transition-all duration-500 ${
                  pathname === "/room" && isScrolled ? "hidden lg:block" : ""
                } ${
                  !isScrolled && pathname === "/"
                    ? "text-white"
                    : "text-foreground"
                }`}
              >
                4STAY
              </span>
            </Link>
          </div>

          <nav
            className={`hidden md:flex items-center space-x-10 transition-all duration-500 ${pathname === "/room" && isScrolled ? "opacity-0 pointer-events-none scale-90 w-0 overflow-hidden" : "opacity-100"}`}
          >
            {[
              { label: t("home"), href: "/" },
              { label: t("Rooms"), href: "/room" },
              { label: "Blog", href: "/blog" },
              { label: t("contact"), href: "/contact" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative elegant-subheading tracking-wide transition-all duration-300 hover:text-primary ${
                  pathname === item.href
                    ? "text-primary elegant-sans"
                    : !isScrolled && pathname === "/"
                      ? "text-white/80"
                      : "text-muted-foreground"
                }`}
              >
                {item.label}
                {pathname === item.href && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  {/* Notification icon */}
                  <div className="flex items-center">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className={`relative flex items-center p-2 rounded-full cursor-pointer bg-white/10 border transition-all duration-300 hover:shadow-md ${!isScrolled && pathname === "/" ? "border-white/20 hover:bg-white/20" : "border-border"}`}
                        >
                          <Bell
                            className={`w-5 h-5 ${!isScrolled && pathname === "/" ? "text-white/70" : "text-muted-foreground"}`}
                          />
                          <NotificationBadge />
                        </button>
                      </PopoverTrigger>

                      <PopoverContent
                        className="w-96 p-2 bg-white/90 dark:bg-black/90 backdrop-blur-2xl shadow-2xl rounded-xl border border-white/20 z-999"
                        align="end"
                        sideOffset={8}
                      >
                        <NotificationList />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Popover open={openMenu} onOpenChange={setOpenMenu}>
                    <PopoverTrigger asChild>
                      <button
                        className={`flex items-center gap-2 p-1.5 cursor-pointer rounded-full bg-white/10 border transition-all duration-300 hover:shadow-md ${
                          !isScrolled && pathname === "/"
                            ? "border-white/20 hover:bg-white/20"
                            : "border-border"
                        }`}
                      >
                        <UserAvatar
                          avatarUrl={user?.avatar}
                          fullName={user.firstName + " " + user.lastName}
                          size="sm"
                        />
                        <span
                          className={`hidden ${pathname === "/room" && isScrolled ? "lg:block" : "sm:block"} elegant-subheading text-xs font-bold px-2 ${
                            !isScrolled && pathname === "/"
                              ? "text-white"
                              : "text-foreground"
                          }`}
                        >
                          {user.firstName}
                        </span>
                      </button>
                    </PopoverTrigger>

                    <PopoverContent
                      className="w-72 p-3 bg-white/90 dark:bg-black/90 backdrop-blur-2xl shadow-2xl rounded-3xl border border-white/20 z-999"
                      align="end"
                      sideOffset={8}
                    >
                      <div className="px-4 py-4 mb-2 bg-primary/5 rounded-2xl border border-primary/10">
                        <p className="text-sm font-bold text-foreground truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                          {user.email || "Explorer"}
                        </p>
                      </div>

                      {/* Navigation links (only visible on mobile below md breakpoint AND when scrolled) */}
                      {isScrolled && (
                        <div className="md:hidden space-y-1 pb-2 mb-2 border-b border-gray-100 dark:border-white/10">
                          {[
                            { label: t("home"), href: "/" },
                            { label: t("Rooms"), href: "/room" },
                            { label: "Blog", href: "/blog" },
                            { label: t("contact"), href: "/contact" },
                          ].map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setOpenMenu(false)}
                              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-foreground hover:bg-primary/10 rounded-xl transition-all duration-200"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      )}

                      <div className="space-y-1">
                        <Link
                          href="/profile"
                          onClick={() => setOpenMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-foreground hover:bg-primary/10 rounded-xl transition-all duration-200"
                        >
                          <UserIcon className="w-4 h-4 text-primary" />
                          {t("myProfile")}
                        </Link>
                        <Link
                          href="/booking"
                          onClick={() => setOpenMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-foreground hover:bg-primary/10 rounded-xl transition-all duration-200"
                        >
                          <CalendarDays className="w-4 h-4 text-primary" />
                          {t("myBookings")}
                        </Link>
                        <button
                          className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-semibold text-foreground hover:bg-primary/10 rounded-xl transition-all duration-200 cursor-pointer"
                          onClick={() => {
                            openNewPassword();
                            setOpenMenu(false);
                          }}
                        >
                          <KeyRound className="w-4 h-4 text-primary" />
                          {t("changePassword")}
                        </button>
                      </div>

                      <div className="mt-2 pt-2 border-t border-gray-100 dark:border-white/10">
                        <button
                          className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all duration-200 cursor-pointer"
                          onClick={() => {
                            logout();
                            setOpenMenu(false);
                          }}
                        >
                          <LogOut className="w-4 h-4" />
                          {t("logout")}
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              ) : (
                <>
                  {/* Desktop Sign In Button */}
                  <Button
                    className="hidden lg:flex rounded-full px-8 py-6 font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                    onClick={openSignIn}
                  >
                    {t("signIn")}
                  </Button>

                  {/* Mobile/Tablet User Menu Button (Logged Out) */}
                  <div className="lg:hidden flex items-center">
                    <Popover open={openMenu} onOpenChange={setOpenMenu}>
                      <PopoverTrigger asChild>
                        <button
                          className={`flex items-center gap-2 p-1.5 rounded-full bg-white/10 border transition-all duration-300 hover:shadow-md ${
                            !isScrolled && pathname === "/"
                              ? "border-white/20 hover:bg-white/20"
                              : "border-border"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-secondary dark:bg-zinc-800 flex items-center justify-center text-muted-foreground">
                            <UserIcon className="w-4 h-4" />
                          </div>
                        </button>
                      </PopoverTrigger>

                      <PopoverContent
                        className="w-72 p-3 bg-white/90 dark:bg-black/90 backdrop-blur-2xl shadow-2xl rounded-3xl border border-white/20 z-999"
                        align="end"
                        sideOffset={8}
                      >
                        {/* Navigation links (only visible on mobile below md breakpoint when scrolled) */}
                        {isScrolled && (
                          <div className="md:hidden space-y-1 pb-2 mb-2 border-b border-gray-100 dark:border-white/10">
                            {[
                              { label: t("home"), href: "/" },
                              { label: t("Rooms"), href: "/room" },
                              { label: "Blog", href: "/blog" },
                              { label: t("contact"), href: "/contact" },
                            ].map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpenMenu(false)}
                                className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-foreground hover:bg-primary/10 rounded-xl transition-all duration-200"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        )}

                        {/* Sign In Button inside menu */}
                        <div className="p-1">
                          <Button
                            className="w-full rounded-xl py-5 font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                            onClick={() => {
                              openSignIn();
                              setOpenMenu(false);
                            }}
                          >
                            <KeyRound className="w-4 h-4" />
                            {t("signIn")}
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </>
              )}
            </div>

            {/* Standalone Hamburger Menu */}
            <div
              className={`${isScrolled ? "hidden md:flex" : "md:hidden flex"} items-center`}
            >
              <Popover open={openMobileMenu} onOpenChange={setOpenMobileMenu}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={`p-2 rounded-full transition-all duration-300 border bg-white/10 ${
                      !isScrolled && pathname === "/"
                        ? "border-white/20 hover:bg-white/20 text-white hover:text-white"
                        : "text-foreground hover:bg-secondary border-border"
                    }`}
                  >
                    <Menu size={20} />
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  className="w-72 p-3 bg-white/90 dark:bg-black/90 backdrop-blur-2xl shadow-2xl rounded-3xl border border-white/20 z-999"
                  align="end"
                  sideOffset={8}
                >
                  <div className="space-y-1">
                    {[
                      { label: t("home"), href: "/" },
                      { label: t("Rooms"), href: "/room" },
                      { label: "Blog", href: "/blog" },
                      { label: t("contact"), href: "/contact" },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpenMobileMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-foreground hover:bg-primary/10 rounded-xl transition-all duration-200"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
