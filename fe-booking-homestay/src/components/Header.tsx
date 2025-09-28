"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "./ui/button";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Header() {
  const { openSignIn, openNewPassword, user, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 bg-background/90 backdrop-blur-sm border-b z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a href="/">
              <Image
                src="/4stay-logo.png"
                alt="Logo"
                width={45}
                height={45}
                className="inline-block mr-1"
              />
              <span className="elegant-heading text-2xl text-foreground">
                4STAY
              </span>
            </a>
          </div>

          <nav className="hidden md:flex space-x-12">
            <a
              href="/"
              className={`elegant-subheading transition-colors ${
                pathname === "/"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground "
              }
              }`}
            >
              Home
            </a>
            <a
              href="#"
              className="elegant-subheading text-muted-foreground hover:text-foreground transition-colors"
            >
              Hotels
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
              href="#"
              className="elegant-subheading text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </a>
          </nav>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setOpenMenu((prev) => !prev)}
                className="flex items-center gap-2"
              >
                <img
                  src={user?.avatar || "/default-avatar.jpg"}
                  // src={"images/default-avatar.jpg"}
                  alt="avatar"
                  className="w-8 h-8 rounded-full"
                />
                <span>{user.firstName + " " + user.lastName}</span>
                {/* <span>Thảo Ly</span> */}
              </button>
              {openMenu && (
                <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-md w-48  border border-gray-100">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 hover:bg-gray-100 rounded-md"
                  >
                    Profile
                  </Link>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md"
                    onClick={openNewPassword}
                  >
                    Change password
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500 rounded-md"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2 elegant-subheading rounded-2xl"
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
              className="elegant-subheading text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </a>
            <a
              href="#"
              className="elegant-subheading text-muted-foreground hover:text-foreground transition-colors"
            >
              Hotels
            </a>
            <a
              href="#"
              className="elegant-subheading text-muted-foreground hover:text-foreground transition-colors"
            >
              Rooms
            </a>
            <a
              href="#"
              className="elegant-subheading text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </a>
            <a
              href="#"
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
