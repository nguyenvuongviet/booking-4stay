"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import axios from "axios";

interface NewPasswordModalProps {
  show: boolean;
  setShow: (show: boolean) => void;
}

export default function NewPasswordModal({
  show,
  setShow,
}: NewPasswordModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [apiError, setApiError] = useState("");
  const { email, otp } = useAuth();

  useEffect(() => {
    setPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setConfirmPasswordError("");
    setShowPassword(false);
    setApiError("");
  }, [show]);

  if (!show) return null;

  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;
    setApiError("");
    if (!password) {
      setPasswordError("Please enter your password!");
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters!");
      hasError = true;
    } else setPasswordError("");
    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password!");
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match!");
      hasError = true;
    } else setConfirmPasswordError("");
    if (hasError) return;

    // Gọi API tạo mật khẩu mới ở đây
    try {
      const { data } = await axios.post(
        "http://localhost:3069/auth/reset-password",
        {
          email,
          otp,
          newPassword: password,
        }
      );
      setShow(false);
    } catch (error: any) {
      if (error.response) {
        setApiError(error.response.data.message);
      } else {
        setApiError("Something went wrong. Please try again.");
      }
    } finally {
      // setLoading(false);
    }
  };

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
            {apiError && (
              <p className="text-red-500 text-sm mb-4">{apiError}</p>
            )}
            <form className="space-y-4" onSubmit={handleCreatePassword}>
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
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="mt-1 border-[#d0d5dd] focus:border-[#3f9bda] focus:ring-[#3f9bda] pr-10"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError("");
                      }}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#667085]"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-red-500 text-sm mb-1">{passwordError}</p>
                  )}
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
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (confirmPasswordError) setConfirmPasswordError("");
                      }}
                    />
                  </div>
                  {confirmPasswordError && (
                    <p className="text-red-500 text-sm mb-1">
                      {confirmPasswordError}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-[#667085] text-xs">
                Use 6 or more characters!
              </p>

              <Button className="w-full bg-[#3f9bda] hover:bg-[#2980b9] text-white py-3">
                Sign in
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
