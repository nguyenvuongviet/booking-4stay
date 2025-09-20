"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "./ui/button";

export default function Header() {
  const { openSignIn, openNewPassword, user, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold text-[#3f9bda]">
              4Stay
            </a>
          </div>

          <nav className="hidden md:flex space-x-8">
            <a
              href="/"
              className="text-[#667085] hover:text-[#344054] font-medium"
            >
              Home
            </a>
            <a
              href="#"
              className="text-[#667085] hover:text-[#344054] font-medium"
            >
              Hotels
            </a>
            <a
              href="#"
              className="text-[#667085] hover:text-[#344054] font-medium"
            >
              Rooms
            </a>
            <a
              href="#"
              className="text-[#667085] hover:text-[#344054] font-medium"
            >
              About
            </a>
            <a
              href="#"
              className="text-[#667085] hover:text-[#344054] font-medium"
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
                  src={user?.avatar || "images/default-avatar.jpg"}
                  // src={"images/default-avatar.jpg"}
                  alt="avatar"
                  className="w-8 h-8 rounded-full"
                />
                <span>{user.fullName}</span>
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
              className="bg-[#3f9bda] hover:bg-[#2980b9] text-white px-6"
              onClick={openSignIn}
            >
              Sign in
            </Button>
          )}
        </div>
      </div>  
    </header>
  );
}
