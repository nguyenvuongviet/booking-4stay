"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";

interface OTPModalsProps {
  show: boolean;
  setShow: (show: boolean) => void;
  context: "signup" | "forgotPassword";
  onSuccess: () => void;
}

export default function OTPModals({
  show,
  setShow,
  context,
  onSuccess,
}: OTPModalsProps) {
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const { email } = useAuth(); // lấy email từ context

  useEffect(() => {
    setOtpValues(["", "", "", "", "", ""]);
    setError("");
  }, [show]);
  
  if (!show) return null;

  const handleVerify = () => {
    const otpCode = otpValues.join("");

    if (otpCode.length < 6) {
      setError("Vui lòng nhập đầy đủ 6 ký tự OTP");
      return;
    }
    setError("");

    // gọi API verify OTP ở đây
    console.log("Xác thực OTP:", otpCode, "cho email:", email);

    if (context === "signup") {
      // OTP cho đăng ký
      alert("Sign up success!");
      onSuccess(); // hoặc setShow(false)
    } else if (context === "forgotPassword") {
      // OTP cho quên mật khẩu
      onSuccess(); // mở NewPasswordModal
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  return (
    <>
      {/* OTP Modal */}
      {show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-[#3f9bda]">4Stay</span>
                <span className="text-xl font-semibold text-[#344054]">
                  Enter OTP
                </span>
              </div>
              <button
                onClick={() => setShow(false)}
                className="text-[#667085] hover:text-[#344054]"
              >
                <X size={24} />
              </button>
            </div>

            <p className="text-[#667085] text-sm mb-6">
              We have sent a OTP to {""}
              <span className="font-semibold text-[#3f9bda]">{email}</span>
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
                  className="w-12 h-12 text-center text-xl font-semibold border border-[#d0d5dd] rounded-lg focus:border-[#3f9bda] focus:ring-1 focus:ring-[#3f9bda] focus:outline-none"
                  onKeyDown={(e) => {
                    //Nhan Enter de verify
                    if (e.key === "Enter") handleVerify();
                    if (e.key === "Backspace" &&!otpValues[index] && index > 0) {
                      const prevInput = document.getElementById(
                        `otp-${index - 1}`
                      );
                      prevInput?.focus();
                    }
                  }} 
                />
              ))}
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <Button
              className="w-full bg-[#3f9bda] hover:bg-[#2980b9] text-white py-3 mb-4"
              onClick={handleVerify}
            >
              Verify OTP
            </Button>

            <div className="text-center">
              <span className="text-[#667085] text-sm">
                Didn't receive code?{" "}
              </span>
              <button className="text-[#3f9bda] text-sm font-medium hover:underline">
                Resend OTP
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
