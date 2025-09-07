"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { Eye, EyeOff, X } from "lucide-react";
import { useEffect, useState } from "react";

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
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");

  //local state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [phone, setPhone] = useState("");

  const { setEmail } = useAuth(); // lấy từ context

  useEffect(() => {
    setFirstName("");
    setLastName("");
    setEmailInput("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setPhoneError("");
    setFirstNameError("");
    setLastNameError("");
    setShowPassword(false);
  }, [show]);

  if (!show) return null;

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (!firstName.trim()) {
      setFirstNameError("Please enter your first name!");
      hasError = true;
    } else setFirstNameError("");
    if (!lastName.trim()) {
      setLastNameError("Please enter your last name!");
      hasError = true;
    } else setLastNameError("");
    if (!phone.trim()) {
      setPhoneError("Please enter your phone number!");
      hasError = true;
    } else setPhoneError("");
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
    if (!emailInput.trim()) {
      setEmailError("Please enter your email!");
      hasError = true;
    } else if (!validateEmail(emailInput.trim())) {
      setEmailError("Please enter a valid email!");
      hasError = true;
    } else setEmailError("");
    if (hasError) return;

    // lưu email vào context để OTPModal có thể dùng
    setEmail(emailInput);

    setShow(false);
    switchToOTP(true);
  };

  return (
    <>
      {/* Sign Up Modal */}
      {show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-[#3f9bda]">Sign up</h2>
              <button
                onClick={() => setShow(false)}
                className="text-[#667085] hover:text-[#344054]"
              >
                <X size={24} />
              </button>
            </div>

            <form className="space-y-1" onSubmit={handleSignUp}>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label
                    htmlFor="firstName"
                    className="text-[#344054] text-sm font-medium"
                  >
                    First name
                  </Label>
                  <Input
                    id="firstName"
                    className="mt-1 border-[#d0d5dd] focus:border-[#3f9bda] focus:ring-[#3f9bda]"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  {firstNameError && (
                    <p className="text-red-500 text-sm mb-1">
                      {firstNameError}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="lastName"
                    className="text-[#344054] text-sm font-medium"
                  >
                    Last name
                  </Label>
                  <Input
                    id="lastName"
                    className="mt-1 border-[#d0d5dd] focus:border-[#3f9bda] focus:ring-[#3f9bda]"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                  {lastNameError && (
                    <p className="text-red-500 text-sm mb-1">{lastNameError}</p>
                  )}
                </div>
              </div>

              <div>
                <Label
                  htmlFor="signupEmail"
                  className="text-[#344054] text-sm font-medium"
                >
                  Your email
                </Label>
                <Input
                  id="signupEmail"
                  type="email"
                  className="mt-1 border-[#d0d5dd] focus:border-[#3f9bda] focus:ring-[#3f9bda]"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
              </div>
              {emailError && (
                <p className="text-red-500 text-sm mb-2">{emailError}</p>
              )}

              <div>
                <Label
                  htmlFor="phone"
                  className="text-[#344054] text-sm font-medium"
                >
                  Your mobile phone number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  className="mt-1 border-[#d0d5dd] focus:border-[#3f9bda] focus:ring-[#3f9bda]"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              {phoneError && (
                <p className="text-red-500 text-sm mb-2">{phoneError}</p>
              )}

              <div className="grid grid-cols-2 gap-2">
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
                  <Input
                    id="confirmSigupPassword"
                    type="password"
                    className="mt-1 border-[#d0d5dd] focus:border-[#3f9bda] focus:ring-[#3f9bda] pr-10"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (confirmPasswordError) setConfirmPasswordError("");
                    }}
                  />
                  {confirmPasswordError && (
                    <p className="text-red-500 text-sm mb-1">
                      {confirmPasswordError}
                    </p>
                  )}
                </div>
                <p className="text-[#667085] text-xs mb-4">
                  Use 6 or more characters!
                </p>
              </div>

              <Button
                className="w-full bg-[#3f9bda] hover:bg-[#2980b9] text-white py-3"
                // onClick={() => {
                //   setShow(false);
                //   switchToOTP(true);
                // }}
              >
                Sign up
              </Button>
            </form>

            <div className="mt-2 text-center">
              <span className="text-[#667085] text-sm">
                Already have an account?{" "}
              </span>
              <button
                onClick={() => {
                  setShow(false);
                  switchToSignIn(true);
                }}
                className="text-[#3f9bda] text-sm font-medium hover:underline"
              >
                Sign in
              </button>
            </div>

            <div className="mt-2 text-center text-[#667085] text-sm">OR</div>

            <div className="mt-2">
              <Button
                variant="outline"
                className="w-full border-[#d0d5dd] text-[#344054] hover:bg-[#f9fafb] flex items-center justify-center gap-2 bg-transparent"
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
