"use client";

import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { AnimatePresence, motion } from "framer-motion";
import {
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
import { createPortal } from "react-dom";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { UserAvatar } from "./UserAvatar";

export default function Header() {
  const { openSignIn, openNewPassword, user, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
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
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-110">
                <Image
                  src="/4stay-logo.png"
                  alt="Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span
                className={`elegant-heading text-2xl tracking-tighter transition-colors ${
                  !isScrolled && pathname === "/"
                    ? "text-white"
                    : "text-foreground"
                }`}
              >
                4STAY
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-10">
            {[
              { label: t("home"), href: "/" },
              { label: t("Rooms"), href: "/room" },
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

          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative">
                <Popover open={openMenu} onOpenChange={setOpenMenu}>
                  <PopoverTrigger asChild>
                    <button
                      className={`flex items-center gap-2 p-1.5 rounded-full border transition-all duration-300 hover:shadow-md ${
                        !isScrolled && pathname === "/"
                          ? "bg-white/10 border-white/20 hover:bg-white/20"
                          : "bg-secondary/30 border-border hover:bg-secondary/40"
                      }`}
                    >
                      <UserAvatar
                        avatarUrl={user?.avatar}
                        fullName={user.firstName + " " + user.lastName}
                        size="sm"
                      />
                      <span
                        className={`hidden sm:block elegant-subheading text-xs font-bold px-2 ${
                          !isScrolled && pathname === "/"
                            ? "text-white"
                            : "text-foreground"
                        }`}
                      >
                        {user.firstName}
                      </span>
                      <Menu
                        className={`w-4 h-4 mr-2 ${
                          !isScrolled && pathname === "/"
                            ? "text-white/70"
                            : "text-muted-foreground"
                        }`}
                      />
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
                        className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-semibold text-foreground hover:bg-primary/10 rounded-xl transition-all duration-200"
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
                        className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all duration-200"
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
              <Button
                className={`rounded-full px-8 py-6 font-bold transition-all duration-300 hover:scale-105 shadow-lg`}
                onClick={openSignIn}
              >
                {t("signIn")}
              </Button>
            )}

            <button
              className={`md:hidden p-2 rounded-full transition-colors ${
                !isScrolled && pathname === "/"
                  ? "text-white hover:bg-white/10"
                  : "text-foreground hover:bg-secondary"
              }`}
              onClick={() => setOpenMobile(!openMobile)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      <AnimatePresence>
        {openMobile &&
          typeof document !== "undefined" &&
          createPortal(
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden fixed top-[72px] left-0 right-0 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-gray-100 dark:border-white/10 shadow-2xl p-6 space-y-6 z-999"
            >
              <nav className="flex flex-col gap-4">
                {[
                  { label: t("home"), href: "/" },
                  { label: t("Rooms"), href: "/room" },
                  { label: t("contact"), href: "/contact" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpenMobile(false)}
                    className={`text-lg font-bold ${
                      pathname === item.href
                        ? "text-primary"
                        : "text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </motion.div>,
            document.body,
          )}
      </AnimatePresence>
    </header>
  );
}
