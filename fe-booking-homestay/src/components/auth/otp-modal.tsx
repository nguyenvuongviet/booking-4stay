"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { active_account, forgot_password, verify_otp } from "@/services/authApi";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface OTPModalsProps {
  show: boolean;
  setShow: (show: boolean) => void;
  context: "signup" | "forgotPassword";
  onSuccess: (otp: string) => void;
}

export default function OTPModals({
  show,
  setShow,
  context,
  onSuccess,
}: OTPModalsProps) {
  const { t } = useLang();
  const [otpValues, setOtpValues] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const [apiError, setApiError] = useState("");
  const { email } = useAuth();

  useEffect(() => {
    if (show) {
      setOtpValues(Array(6).fill(""));
      setApiError("");
      setError("");
      document.getElementById("otp-0")?.focus();
    }
  }, [show]);

  if (!show) return null;

  const otpCode = otpValues.join("");

  const verifySignup = async () => {
    await active_account({ email, otp: otpCode });
    return otpCode;
  };

  const handleVerify = async () => {
    if (otpCode.length < 6) {
      setError("Vui lòng nhập đủ 6 số");
      return;
    }

    setError("");
    setApiError("");

    try {
      await verifySignup();

      toast.success("Xác thực OTP thành công!");

      setShow(false);
    } catch (err: any) {
      setApiError(err?.response?.data?.message || "Mã OTP không hợp lệ!");
      setOtpValues(Array(6).fill(""));
      document.getElementById("otp-0")?.focus();
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
      e.preventDefault();
      setApiError("");
      try {
        await forgot_password({ email: email.trim() });
      } catch (error: any) {
        setApiError(error.response?.data?.message || "Failed to send OTP!");
      }
    };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };


  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("Text").trim();

    if (!/^\d{1,6}$/.test(pasteData)) return; // chỉ chấp nhận số, tối đa 6 ký tự

    const newOtpValues = [...otpValues];
    for (let i = 0; i < 6; i++) {
      newOtpValues[i] = pasteData[i] || "";
      const input = document.getElementById(`otp-${i}`) as HTMLInputElement | null;
      if (input) input.value = newOtpValues[i];
    }

    setOtpValues(newOtpValues);

    // focus ô trống đầu tiên
    const firstEmptyIndex = newOtpValues.findIndex(v => !v);
    if (firstEmptyIndex !== -1) {
      const nextInput = document.getElementById(`otp-${firstEmptyIndex}`);
      nextInput?.focus();
    } else {
      // nếu đầy 6 ký tự thì focus ô cuối
      const lastInput = document.getElementById(`otp-5`);
      lastInput?.focus();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 shadow-xl w-full max-w-md">
        <div className="flex items-center justify-center mb-4 relative">
          <button
            className="absolute right-0"
            onClick={() => setShow(false)}
          >
            <X size={24} />
          </button>
          <h2 className="text-3xl elegant-heading text-primary text-center">
            {t("Enter")} OTP
          </h2>
        </div>
        <p className="text-sm mb-4 text-muted-foreground text-center">
          {t("We have sent an OTP to")}{" "}
          <b className="elegant-sans text-secondary-foreground">{email}</b>
        </p>
        {apiError && (
          <p className="text-destructive text-xs mb-3 mx-6">{apiError}</p>
        )}
        {error && <p className="text-destructive text-xs mb-3 mx-6">{error}</p>}

        <div className="flex justify-center gap-2 mb-6">
          {otpValues.map((v, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              type="text"
              maxLength={1}
              inputMode="numeric"
              value={v}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onPaste={handleOtpPaste}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleVerify();
                if (e.key === "Backspace" && !otpValues[i] && i > 0) {
                  const prevInput = document.getElementById(`otp-${i - 1}`);
                  prevInput?.focus();
                }
              }}
              className="w-12 h-12 border text-center text-xl rounded-lg focus:outline-none"
            />
          ))}
        </div>

        <Button className="w-full mb-4" onClick={handleVerify}>
          {t("Verify")} OTP
        </Button>

        <div className="text-center">
          <span className="text-muted-foreground text-sm">
            {t("no_code")}
          </span>
          <button
            type="button"
            className="text-primary text-sm elegant-sans hover:underline"
            onClick={handleSendOtp}
          >
            {t("Resend")} OTP
          </button>
        </div>
      </div>
    </div >
  );
}
