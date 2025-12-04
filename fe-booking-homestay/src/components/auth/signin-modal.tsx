"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STORAGE_KEYS } from "@/constants";
import { useAuth } from "@/context/auth-context";
import { login } from "@/services/authApi";
import { Eye, EyeOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import GoogleLoginButton from "./GoogleLoginButton";
import { useLang } from "@/context/lang-context";

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
  const {t} = useLang();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  //local state
  const [emailInput, setEmailInput] = useState("");
  const { setUser } = useAuth();

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
      const { data } = await login({
        email: emailInput.trim(),
        password,
      });
      setUser(data.user);

      console.log("API response:", data);
      // lưu email vào context để OTPModal có thể dùng
      setEmailInput(emailInput.trim());
      localStorage.setItem(
        STORAGE_KEYS.CURRENT_USER,
        JSON.stringify({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
        })
      );
      setShow(false);
    } catch (error: any) {
      if (error.response) {
        // const message = error.response.data?.message || "Sign in failed!";
        const message = "Incorrect email or password!";
        setApiError(message);
        console.error("API Error:", error.response.data);
      } else {
        setApiError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Sign In Modal */}
      {show && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex justify-end">
              <button
                onClick={() => setShow(false)}
                className="hover:text-primary cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            <div className="text-center mb-4">
              <h2 className="text-3xl elegant-heading text-primary">{t("SIGN IN")}</h2>
            </div>

            {apiError && (
              <p className="text-destructive text-sm mt-2">{apiError}</p>
            )}

            <form className="space-y-4 mt-2" onSubmit={handleSignIn}>
              <div>
                <Label
                  htmlFor="email"
                  className="text-foreground elegant-subheading"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  className="mt-1 bg-input rounded-2xl"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
              </div>
              {emailError && (
                <p className="text-destructive text-sm mb-4">{emailError}</p>
              )}

              <div>
                <div className="flex justify-between items-center">
                  <Label
                    htmlFor="password"
                    className="text-foreground elegant-subheading"
                  >
                    {t("Your password")}
                  </Label>
                  <button
                    type="button"
                    className="text-muted-foreground text-sm hover:text-primary flex items-center gap-1"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    {showPassword ? t("Hide") : t("Show")}
                  </button>
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="mt-1 bg-input rounded-2xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {passwordError && (
                <p className="text-destructive text-sm mb-4">{passwordError}</p>
              )}

              <Button
                className="mt-4 rounded-2xl w-full bg-primary hover:bg-primary/80 h-10 elegant-subheading text-md"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : t("signIn")}
              </Button>
            </form>

            <div className="mt-4 flex justify-between items-center text-sm">
              <div>
                <span className="text-muted-foreground text-xs elegant-subheading">
                  {t("no_account")}
                </span>
                <button
                  onClick={() => {
                    setShow(false);
                    switchToSignUp(true);
                  }}
                  className="text-primary elegant-subheading text-sm hover:underline"
                >
                  {t("signUp")}
                </button>
              </div>
              <div>
                <button
                  className="text-primary elegant-subheading hover:underline"
                  onClick={() => {
                    switchToForgotPassword(true);
                    setShow(false);
                  }}
                >
                  {t("Forgot password")}?
                </button>
              </div>
            </div>

            <div className="flex items-center mt-6">
              <div className="grow border-t border-border"></div>
              <span className="mx-4 elegant-subheading text-muted-foreground text-sm">
                OR
              </span>
              <div className="grow border-t border-border"></div>
            </div>

            <div className="mt-6">
              <GoogleLoginButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
