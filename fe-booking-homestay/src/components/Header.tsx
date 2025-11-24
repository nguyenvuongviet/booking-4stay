"use client";

import { useAuth } from "@/context/auth-context";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";

export default function Header() {
  const { openSignIn, openNewPassword, user, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-b z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center justify-between">
            <a href="/">
              <Image
                src="/4stay-logo.png"
                alt="Logo"
                width={45}
                height={45}
                className="inline-block mr-1 "
              />
              <span className="elegant-heading text-2xl text-foreground">
                4STAY
              </span>
            </a>
          </div>

          <nav className="hidden md:flex space-x-12">
            <a
              href="/"
              className={`elegant-subheading text-lg transition-colors ${
                pathname === "/"
                  ? "text-primary elegant-sans"
                  : "text-muted-foreground hover:text-primary"
              }
              }`}
            >
              Home
            </a>
            <a
              href="/room-list"
              className={`elegant-subheading text-lg transition-colors ${
                pathname === "/room-list"
                  ? "text-primary elegant-sans"
                  : "text-muted-foreground hover:text-primary"
              }
              }`}
            >
              Rooms
            </a>
            {/* <a
              href="#"
              className="elegant-subheading text-muted-foreground hover:text-foreground transition-colors"
            >
              Rooms
            </a> */}
            {/* <a
              href="#"
              className="elegant-subheading text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </a> */}
            <a
              href="/contact"
              className={`elegant-subheading text-lg transition-colors ${
                pathname === "/contact"
                  ? "text-primary elegant-sans"
                  : "text-muted-foreground hover:text-primary"
              }
              }`}
            >
              Contact
            </a>
          </nav>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setOpenMenu((prev) => !prev)}
                className="flex items-center gap-2 hover:cursor-pointer"
              >
                <img
                  src={user?.avatar || "/default-avatar.png"}
                  // src={"images/default-avatar.jpg"}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-secondary-foreground elegant-subheading">
                  {user.firstName + " " + user.lastName}
                </span>
                {/* <span>Thảo Ly</span> */}
              </button>
              {openMenu && (
                <div className="absolute right-0 mt-2 bg-card shadow-lg rounded-md w-48  border border-gray-100">
                  <Link
                    href="/profile"
                    onClick={() => setOpenMenu(false)}
                    className="block px-4 py-2 hover:bg-secondary/50 rounded-md"
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/booking"
                    onClick={() => setOpenMenu(false)}
                    className="block px-4 py-2 hover:bg-secondary/50  rounded-md"
                  >
                    My Bookings
                  </Link>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-secondary/50 rounded-md"
                    onClick={() => {
                      openNewPassword();
                      setOpenMenu(false);
                    }}
                  >
                    Change password
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-secondary/50 text-red-500 rounded-md"
                    onClick={() => {
                      logout();
                      setOpenMenu(false);
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button
              className="bg-primary hover:bg-primary/80 px-8 py-2 rounded-2xl"
              onClick={openSignIn}
            >
              Sign in
            </Button>
          )}

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <button
              className="text-gray-700 hover:text-blue-600"
              onClick={() => setOpenMobile(!openMobile)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {openMobile && (
        <div className="md:hidden bg-white border-t shadow-md">
          <nav className="flex flex-col space-y-2 px-4 py-3">
            <a
              href="/"
              onClick={() => setOpenMobile(false)}
              className="elegant-subheading text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </a>
            <a
              href="/room-list"
              onClick={() => setOpenMobile(false)}
              className="elegant-subheading text-muted-foreground hover:text-foreground transition-colors"
            >
              Hotels
            </a>

            <a
              href="#"
              onClick={() => setOpenMobile(false)}
              className="elegant-subheading text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
