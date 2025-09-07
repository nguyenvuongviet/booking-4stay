"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, X } from "lucide-react";
import { useState } from "react";

interface NewPasswordModalProps {
  show: boolean;
  setShow: (show: boolean) => void;
}

export default function NewPasswordModal({
  show,
  setShow,
}: NewPasswordModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  if (!show) return null;
  return (
    <>
      {/* New Password Modal */}
      {show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-[#3f9bda]">
                Create new password
              </h2>
              <button
                onClick={() => setShow(false)}
                className="text-[#667085] hover:text-[#344054]"
              >
                <X size={24} />
              </button>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label
                    htmlFor="signupPassword"
                    className="text-[#344054] text-sm font-medium"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="signupPassword"
                      type={showPassword ? "text" : "password"}
                      className="mt-1 border-[#d0d5dd] focus:border-[#3f9bda] focus:ring-[#3f9bda] pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#667085]"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="confirmPassword"
                    className="text-[#344054] text-sm font-medium"
                  >
                    Confirm your password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type="password"
                      className="mt-1 border-[#d0d5dd] focus:border-[#3f9bda] focus:ring-[#3f9bda] pr-10"
                    />
                  </div>
                </div>
              </div>

              <p className="text-[#667085] text-xs">
                Use 8 or more characters with a mix of letters, numbers &
                symbols
              </p>

              <Button
                className="w-full bg-[#3f9bda] hover:bg-[#2980b9] text-white py-3"
                onClick={() => {
                  setShow(false);
                }}
              >
                Sign in
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
