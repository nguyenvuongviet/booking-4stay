"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { active_account, verify_otp } from "@/services/authApi";
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

  const verifyForgot = async () => {
    await verify_otp({ email, otp: otpCode });
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
      let verifiedOtp = "";

      if (context === "signup") verifiedOtp = await verifySignup();
      if (context === "forgotPassword") verifiedOtp = await verifyForgot();

      toast.success("Xác thực OTP thành công!");

      setShow(false);
      onSuccess(verifiedOtp);
    } catch (err: any) {
      setApiError(err?.response?.data?.message || "Mã OTP không hợp lệ!");
      setOtpValues(Array(6).fill(""));
      document.getElementById("otp-0")?.focus();
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

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 shadow-xl w-[380px]">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">Enter OTP</h2>
          <button onClick={() => setShow(false)}>
            <X size={24} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Chúng tôi đã gửi mã OTP đến <b>{email}</b>
        </p>

        {apiError && <p className="text-red-500 text-sm mb-3">{apiError}</p>}
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

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
              className="w-12 h-12 border text-center text-xl rounded-lg"
            />
          ))}
        </div>

        <Button className="w-full mb-4" onClick={handleVerify}>
          Verify OTP
        </Button>

        <button className="text-sm text-primary mx-auto block">
          Resend OTP
        </button>
      </div>
    </div>
  );
}
