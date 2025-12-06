"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { register } from "@/services/authApi";
import { Eye, EyeOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import GoogleLoginButton from "./GoogleLoginButton";
import { useLang } from "@/context/lang-context";

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
  const { t } = useLang();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  //local state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [phone, setPhone] = useState("");

  const { setEmail } = useAuth(); // lấy từ context
  const { setPassword } = useAuth();

  useEffect(() => {
    setFirstName("");
    setLastName("");
    setEmailInput("");
    setPhone("");
    setPasswordInput("");
    setConfirmPassword("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setPhoneError("");
    setFirstNameError("");
    setLastNameError("");
    setApiError("");
    setShowPassword(false);
  }, [show]);

  if (!show) return null;

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sign In button clicked");
    let hasError = false;

    if (!firstName.trim()) {
      setFirstNameError("Vui lòng nhập Họ của bạn!");
      hasError = true;
    } else setFirstNameError("");
    if (!lastName.trim()) {
      setLastNameError("Vui lòng nhập Tên của bạn!");
      hasError = true;
    } else setLastNameError("");
    if (!phone.trim()) {
      setPhoneError("Vui lòng nhập số điện thoại!");
      hasError = true;
    } else setPhoneError("");
    if (!passwordInput) {
      setPasswordError("Vui lòng nhập mật khẩu!");
      hasError = true;
    } else if (passwordInput.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 kí tự!");
      hasError = true;
    } else setPasswordError("");
    if (!confirmPassword) {
      setConfirmPasswordError("Xác nhận mật khẩu!");
      hasError = true;
    } else if (passwordInput !== confirmPassword) {
      setConfirmPasswordError("Mật khẩu không trùng khớp!");
      hasError = true;
    } else setConfirmPasswordError("");
    if (!emailInput.trim()) {
      setEmailError("Vui lòng nhập email!");
      hasError = true;
    } else if (!validateEmail(emailInput.trim())) {
      setEmailError("Vui lòng nhập email đúng!");
      hasError = true;
    } else setEmailError("");
    if (hasError) return;

    setApiError("");
    setLoading(true);

    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: emailInput.trim(),
        password: passwordInput,
        phoneNumber: phone.trim(),
      });

      // lưu email vào context để OTPModal có thể dùng
      setEmail(emailInput);
      setPassword(passwordInput);
      setShow(false);
      switchToOTP(true);
    } catch (error: any) {
      if (error.response) {
        setApiError(error.response.data.message || "Sign up failed!");
      } else {
        setApiError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Sign Up Modal */}
      {show && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-center mb-4 relative">
              <button
                className="absolute right-0"
                onClick={() => setShow(false)}
              >
                <X size={24} />
              </button>
              <h2 className="text-3xl elegant-heading text-primary text-center">
                {t("SIGN UP")}
              </h2>
            </div>
            {apiError && (
              <p className="text-destructive text-left text-sm mt-4 elegant-subheading">
                {apiError}
              </p>
            )}
            <form className="space-y-1" onSubmit={handleSignUp}>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label
                    htmlFor="firstName"
                    className="text-foreground elegant-subheading"
                  >
                    {t("firstName")}
                  </Label>
                  <Input
                    id="firstName"
                    className="bg-input rounded-2xl mt-1 mb-2"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  {firstNameError && (
                    <p className="text-destructive text-xs mb-1">
                      {firstNameError}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="lastName"
                    className="text-foreground elegant-subheading"
                  >
                    {t("lastName")}
                  </Label>
                  <Input
                    id="lastName"
                    className="bg-input rounded-2xl mt-1 mb-2"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                  {lastNameError && (
                    <p className="text-destructive text-xs mb-1">
                      {lastNameError}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label
                  htmlFor="signupEmail"
                  className="text-foreground elegant-subheading"
                >
                  Email
                </Label>
                <Input
                  id="signupEmail"
                  type="email"
                  className="bg-input rounded-2xl mt-1 mb-2"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
              </div>
              {emailError && (
                <p className="text-destructive text-xs mb-2">{emailError}</p>
              )}

              <div>
                <Label
                  htmlFor="phone"
                  className="text-foreground elegant-subheading"
                >
                  {t("phone")}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  className="bg-input rounded-2xl mt-1 mb-2"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              {phoneError && (
                <p className="text-destructive text-xs mb-2">{phoneError}</p>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label
                    htmlFor="signupPassword"
                    className="text-foreground elegant-subheading"
                  >
                    {t("Your password")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="signupPassword"
                      type={showPassword ? "text" : "password"}
                      className="bg-input rounded-2xl mt-1 mb-2"
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
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
                    <p className="text-destructive text-xs mb-1">
                      {passwordError}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="confirmPassword"
                    className="text-foreground elegant-subheading"
                  >
                    {t("Confirm your password")}
                  </Label>
                  <Input
                    id="confirmSignupPassword"
                    type="password"
                    className="bg-input rounded-2xl mt-1 mb-2"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (confirmPasswordError) setConfirmPasswordError("");
                    }}
                  />
                  {confirmPasswordError && (
                    <p className="text-destructive text-xs mb-1">
                      {confirmPasswordError}
                    </p>
                  )}
                </div>
                <p className="text-muted-foreground elegant-subheading text-xs mb-4">
                  {t("Use 6 or more characters")}!
                </p>
              </div>

              <Button
                className="rounded-2xl w-full bg-primary hover:bg-primary/80 h-10 elegant-subheading text-md"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing up..." : t("signUp")}
              </Button>
            </form>

            <div className="mt-2 text-center">
              <span className="text-muted-foreground elegant-subheading text-xs">
                {t("Already have an account")}
              </span>
              <button
                onClick={() => {
                  setShow(false);
                  switchToSignIn(true);
                }}
                className="text-primary elegant-subheading text-sm hover:underline"
              >
                {t("signIn")}
              </button>
            </div>

            <div className="flex items-center my-4">
              <div className="grow border-t border-border"></div>
              <span className="mx-4 elegant-subheading text-muted-foreground text-sm">
                OR
              </span>
              <div className="grow border-t border-border"></div>
            </div>

            <div className="mt-2">
              <GoogleLoginButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
