"use client";

import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import {
  validateEmail,
  validatePasswordStrength,
  validatePhoneNumber,
} from "@/_helper/validation.helper";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { register } from "@/services/authApi";
import { Eye, EyeOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import GoogleLoginButton from "./GoogleLoginButton";

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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const firstNameErr = !firstName.trim() ? "Vui lòng nhập Họ của bạn!" : "";
    const lastNameErr = !lastName.trim() ? "Vui lòng nhập Tên của bạn!" : "";
    const emailErr = validateEmail(emailInput);
    const phoneErr = validatePhoneNumber(phone);
    const pwdErr = validatePasswordStrength(passwordInput);
    let confirmPwdErr = "";

    if (!confirmPassword) {
      confirmPwdErr = "Xác nhận mật khẩu!";
    } else if (passwordInput !== confirmPassword) {
      confirmPwdErr = "Mật khẩu không trùng khớp!";
    }

    setFirstNameError(firstNameErr);
    setLastNameError(lastNameErr);
    setEmailError(emailErr);
    setPhoneError(phoneErr);
    setPasswordError(pwdErr);
    setConfirmPasswordError(confirmPwdErr);

    if (
      firstNameErr ||
      lastNameErr ||
      emailErr ||
      phoneErr ||
      pwdErr ||
      confirmPwdErr
    ) {
      return;
    }

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
                className="absolute right-0 cursor-pointer"
                onClick={() => setShow(false)}
              >
                <X size={24} />
              </button>
              <h2 className="text-3xl elegant-heading text-primary text-center">
                {t("SIGN UP")}
              </h2>
            </div>
            {apiError && (
              <p className="text-destructive text-left text-sm mt-4 elegant-subheading mb-4">
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
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      setFirstNameError(
                        e.target.value.trim()
                          ? ""
                          : "Vui lòng nhập Họ của bạn!",
                      );
                    }}
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
                    onChange={(e) => {
                      setLastName(e.target.value);
                      setLastNameError(
                        e.target.value.trim()
                          ? ""
                          : "Vui lòng nhập Tên của bạn!",
                      );
                    }}
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
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    setEmailError(validateEmail(e.target.value));
                  }}
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
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setPhoneError(validatePhoneNumber(e.target.value));
                  }}
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
                        setPasswordError(
                          validatePasswordStrength(e.target.value),
                        );
                        if (confirmPassword) {
                          setConfirmPasswordError(
                            e.target.value === confirmPassword
                              ? ""
                              : "Mật khẩu không trùng khớp!",
                          );
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary/80 cursor-pointer"
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
                      setConfirmPasswordError(
                        passwordInput === e.target.value
                          ? ""
                          : "Mật khẩu không trùng khớp!",
                      );
                    }}
                  />
                  {confirmPasswordError && (
                    <p className="text-destructive text-xs mb-1">
                      {confirmPasswordError}
                    </p>
                  )}
                </div>

                <p className="text-muted-foreground elegant-subheading text-[10px] mb-4 leading-relaxed col-span-2">
                  Yêu cầu mật khẩu mạnh: Tối thiểu 8 ký tự, gồm ít nhất 1 chữ
                  hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt (@, $, !, %, *, ?,
                  &).
                </p>
              </div>

              <Button
                className="rounded-2xl w-full bg-primary hover:bg-primary/80 h-10 elegant-subheading text-md cursor-pointer"
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
                className="text-primary elegant-subheading text-sm hover:underline cursor-pointer"
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
