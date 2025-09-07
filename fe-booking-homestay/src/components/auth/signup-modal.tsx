"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";

interface SignUpModalProps {
  show: boolean;
  setShow: (show: boolean) => void;
  switchToSignIn: (show: boolean) => void;
  switchToOTP: (show: boolean) => void;
}

export default function SignUpModal({
  show,
  setShow,
  switchToSignIn,
  switchToOTP,
}: SignUpModalProps) {
  const [showPassword, setShowPassword] = useState(false);

  // local state cho form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [phone, setPhone] = useState("");

  const { setEmail } = useAuth(); // lấy từ context

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailInput) {
      alert("Please enter your email!");
      return;
    }

    // lưu email vào context để OTPModal có thể dùng
    setEmail(emailInput);

    setShow(false);
    switchToOTP(true);
  };

  return (
    <>
      {show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4 shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-[#3f9bda]">Sign up</h2>
              <button
                onClick={() => setShow(false)}
                className="text-[#667085] hover:text-[#344054]"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSignUp}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="signupEmail">Your email</Label>
                <Input
                  id="signupEmail"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="phone">Your mobile phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="signupPassword">Password</Label>
                  <div className="relative">
                    <Input
                      id="signupPassword"
                      type={showPassword ? "text" : "password"}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm your password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
              </div>

              <p className="text-xs text-[#667085]">
                Use 8 or more characters with a mix of letters, numbers & symbols
              </p>

              <Button type="submit" className="w-full bg-[#3f9bda] text-white py-3">
                Sign up
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-4 text-center">
              <span className="text-sm text-[#667085]">
                Already have an account?{" "}
              </span>
              <button
                onClick={() => {
                  setShow(false);
                  switchToSignIn(true);
                }}
                className="text-sm font-medium text-[#3f9bda] hover:underline"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
