"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { reset_password } from "@/services/authApi";
import { Eye, EyeOff, X } from "lucide-react";
import { useEffect, useState } from "react";

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
      const { data } = await reset_password({
        email,
        otp,
        newPassword: password,
      });
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
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-8 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex justify-end">
              <button
                onClick={() => setShow(false)}
                className="text-primary hover:text-primary/80"
              >
                <X size={24} />
              </button>
            </div>

            <div className="text-center mb-4">
              <h2 className="text-3xl elegant-heading text-primary">
                Create new password
              </h2>
            </div>
            {apiError && (
              <p className="text-destructive text-sm mb-4">{apiError}</p>
            )}
            <form className="space-y-4" onSubmit={handleCreatePassword}>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label
                    htmlFor="signupPassword"
                    className="text-foreground elegant-subheading"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="bg-input rounded-2xl mt-1 mb-2 pr-10"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError("");
                      }}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary/80"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-destructive text-sm mb-1">
                      {passwordError}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="confirmPassword"
                    className="text-foreground elegant-subheading"
                  >
                    Confirm your password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type="password"
                      className="bg-input rounded-2xl mt-1 mb-2 pr-10"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (confirmPasswordError) setConfirmPasswordError("");
                      }}
                    />
                  </div>
                  {confirmPasswordError && (
                    <p className="text-destructive text-sm mb-1">
                      {confirmPasswordError}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-muted-foreground elegant-subheading text-xs mb-4">
                Use 6 or more characters!
              </p>

              <Button className="rounded-2xl w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 elegant-subheading text-md">
                Sign in
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
