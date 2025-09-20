"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { Eye, EyeOff, X } from "lucide-react";
import { useEffect, useState } from "react";

interface SignInModalProps {
  show: boolean;
  setShow: (show: boolean) => void;
  switchToSignUp: (show: boolean) => void;
  switchToForgotPassword: (show: boolean) => void;
}

export default function SignInModal({
  show,
  setShow,
  switchToSignUp,
  switchToForgotPassword,
}: SignInModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  //local state
  const [emailInput, setEmailInput] = useState("");
  const { login, setEmail } = useAuth();

  useEffect(() => {
    setEmailInput("");
    setPassword("");
    setEmailError("");
    setPasswordError("");
    setApiError("");
  }, [show]);

  if (!show) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    let hasError = false;

    if (!emailInput.trim()) {
      setEmailError("Please enter your email!");
      hasError = true;
    } else setEmailError("");

    if (!password) {
      setPasswordError("Please enter your password!");
      hasError = true;
    } else setPasswordError("");
    if (hasError) return;

    setLoading(true);

    try {
      // const { data } = await api.post("/auth/login", {
      //   email: emailInput.trim(),
      //   password,
      // });
      await login(emailInput.trim(), password);
      console.log("Đăng nhập thành công 🎉");
     
      // lưu email vào context để OTPModal có thể dùng
      setEmail(emailInput.trim());
      setShow(false);
    } catch (error: any) {
      if (error.response) {
        setApiError(error.response.data.message || "Sign in failed!");
      } else {
        setApiError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = (provider: "google") => {
    // Chuyển hướng tới backend OAuth endpoint
    window.location.href = `http://localhost:3069/auth/${provider}`;
  };

  return (
    <>
      {/* Sign In Modal */}
      {show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-[#3f9bda]">Sign in</h2>
              <button
                onClick={() => setShow(false)}
                className="text-[#667085] hover:text-[#344054]"
              >
                <X size={24} />
              </button>
            </div>

            {apiError && (
              <p className="text-red-500 text-sm mt-2">{apiError}</p>
            )}

            <form className="space-y-4 mt-2" onSubmit={handleSignIn}>
              <div>
                <Label
                  htmlFor="email"
                  className="text-[#344054] text-sm font-medium"
                >
                  Your email
                </Label>
                <Input
                  id="email"
                  type="email"
                  className="mt-1 border-[#d0d5dd] focus:border-[#3f9bda] focus:ring-[#3f9bda]"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
              </div>
              {emailError && (
                <p className="text-red-500 text-sm mb-4">{emailError}</p>
              )}

              <div>
                <div className="flex justify-between items-center">
                  <Label
                    htmlFor="password"
                    className="text-[#344054] text-sm font-medium"
                  >
                    Your password
                  </Label>
                  <button
                    type="button"
                    className="text-[#667085] text-sm hover:text-[#344054] flex items-center gap-1"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="mt-1 border-[#d0d5dd] focus:border-[#3f9bda] focus:ring-[#3f9bda]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {passwordError && (
                <p className="text-red-500 text-sm mb-4">{passwordError}</p>
              )}

              <Button
                className="w-full bg-[#3f9bda] hover:bg-[#2980b9] text-white py-3"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-4 flex justify-between items-center text-sm">
              <div>
                <span className="text-[#667085] text-sm">
                  Don't have an account?{" "}
                </span>
                <button
                  onClick={() => {
                    setShow(false);
                    switchToSignUp(true);
                  }}
                  className="text-[#3f9bda] text-sm font-medium hover:underline"
                >
                  Sign up
                </button>
              </div>
              <div>
                <button
                  className="text-[#3f9bda] text-sm hover:underline"
                  onClick={() => {
                    switchToForgotPassword(true);
                    setShow(false);
                  }}
                >
                  Forgot your password?
                </button>
              </div>
            </div>

            <div className="flex items-center mt-6">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 text-[#667085] text-sm">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <div className="mt-6">
              <Button
                type="button"
                variant="outline"
                className="w-full border-[#d0d5dd] text-[#344054] hover:bg-[#f9fafb] flex items-center justify-center gap-2 bg-transparent"
                onClick={() => handleSocialSignIn("google")}
                disabled={loading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285f4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34a853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#fbbc05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#ea4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
