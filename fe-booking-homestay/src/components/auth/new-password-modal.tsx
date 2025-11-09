"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgot_password, reset_password, verify_otp } from "@/services/authApi";
import { Eye, EyeOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface NewPasswordModalProps {
  show: boolean;
  setShow: (show: boolean) => void;
}

export default function NewPasswordModal({ show, setShow }: NewPasswordModalProps) {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: password
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [apiError, setApiError] = useState("");
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (!show) return;
    setStep(1);
    setPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setConfirmPasswordError("");
    setShowPassword(false);
    setApiError("");
    setOtpValues(["", "", "", "", "", ""]);
    setEmail("");
    setOtp("");
  }, [show]);

  if (!show) return null;

  // === STEP 1: SEND OTP ===
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setApiError("Please enter your email!");
      return;
    }
    setApiError("");
    try {
      await forgot_password({ email: email.trim() });
      setStep(2);
    } catch (error: any) {
      setApiError(error.response?.data?.message || "Failed to send OTP!");
    }
  };

  // === STEP 2: VERIFY OTP ===
  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const otpCode = otpValues.join("");
    if (otpCode.length < 6) {
      setError("Please enter full 6-digit OTP");
      return;
    }
    setError("");
    try {
      await verify_otp({ email: email.trim(), otp: otpCode });
      setOtp(otpCode);
      setStep(3);
    } catch (error: any) {
      setApiError(error.response?.data?.message || "Invalid OTP!");
      setOtpValues(["", "", "", "", "", ""]);
      const firstInput = document.getElementById("otp-0");
      firstInput?.focus();
    }
  };

  // === STEP 3: RESET PASSWORD ===
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

    try {
      await reset_password({ email, otp, newPassword: password });
      toast.success("Password reset successfully!");
      setShow(false);
    } catch (error: any) {
      setApiError(error.response?.data?.message || "Something went wrong!");
      toast.error(error.response?.data?.message || "Something went wrong!");
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-8 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex justify-end">
          <button onClick={() => setShow(false)} className="cursor-pointer hover:text-primary">
            <X size={24} />
          </button>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-3xl elegant-heading text-primary">
            {step === 1 && "Confirm your email"}
            {step === 2 && "Enter OTP"}
            {step === 3 && "Create new password"}
          </h2>
        </div>

        {apiError && <p className="text-destructive text-sm mb-4 text-center">{apiError}</p>}

        {/* STEP 1: EMAIL */}
        {step === 1 && (
          <form className="space-y-4" onSubmit={handleSendOtp}>
            <div>
              <Label htmlFor="email">Your email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="mt-2 mb-6 bg-input rounded-2xl placeholder:text-muted"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button className="w-full rounded-2xl mb-10" type="submit">
              Next
            </Button>
          </form>
        )}

        {/* STEP 2: OTP */}
        {step === 2 && (
          <form className="space-y-4" onSubmit={handleVerify}>
            <p className="text-foreground elegant-subheading mb-4 text-center">
              We have sent an OTP to{" "}
              <span className="font-semibold text-secondary-foreground">{email}</span>
            </p>
            <div className="flex justify-center gap-2 mb-6">
              {otpValues.map((value, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  className="w-12 h-12 text-center text-xl font-semibold border border-border rounded-lg focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleVerify();
                    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
                      const prevInput = document.getElementById(`otp-${index - 1}`);
                      prevInput?.focus();
                    }
                  }}
                />
              ))}
            </div>

            {error && <p className="text-destructive text-sm mb-4">{error}</p>}

            <Button className="w-full rounded-2xl" type="submit">
              Verify OTP
            </Button>

            <div className="text-center">
              <span className="text-muted-foreground text-sm">
                Didn’t receive code?{" "}
              </span>
              <button
                type="button"
                className="text-primary font-medium hover:underline"
                onClick={handleSendOtp}
              >
                Resend OTP
              </button>
            </div>
            <p
              onClick={() => setStep(1)}
              className="text-sm text-primary hover:underline text-center cursor-pointer"
            >
              Back to email
            </p>
          </form>
        )}

        {/* STEP 3: NEW PASSWORD */}
        {step === 3 && (
          <form className="space-y-4" onSubmit={handleCreatePassword}>
            <div>
              <Label htmlFor="password">Password</Label>
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
              {passwordError && <p className="text-destructive text-sm">{passwordError}</p>}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm your password</Label>
              <Input
                id="confirmPassword"
                type="password"
                className="bg-input rounded-2xl mt-1 mb-2"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (confirmPasswordError) setConfirmPasswordError("");
                }}
              />
              {confirmPasswordError && (
                <p className="text-destructive text-sm">{confirmPasswordError}</p>
              )}
            </div>

            <p className="text-muted-foreground text-xs mb-4">
              Use 6 or more characters!
            </p>

            <Button className="rounded-2xl w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 mb-2">
              Reset Password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
