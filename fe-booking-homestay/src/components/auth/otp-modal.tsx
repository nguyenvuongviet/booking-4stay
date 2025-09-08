"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import axios from "axios";

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
  const [apiError, setApiError] = useState("");
  const { email } = useAuth();
  const { setOtp } = useAuth();
  // const [loading, setLoading] = useState(false);

  useEffect(() => {
    setOtpValues(["", "", "", "", "", ""]);
    setError("");
    setApiError("");
  }, [show]);

  if (!show) return null;

  const handleVerify = async () => {
    const otpCode = otpValues.join("");
    const firstInput = document.getElementById("otp-0");

    setApiError("");

    if (otpCode.length < 6) {
      setError("Vui lòng nhập đầy đủ 6 ký tự OTP");
      return;
    }
    setError("");

    // gọi API verify OTP ở đây
    console.log("Xác thực OTP:", otpCode, "cho email:", email);

    // setLoading(true);
    try {
      if (context === "signup") {
        // alert("Sign up success!");
        try {
          const { data } = await axios.post(
            "http://localhost:3069/auth/activate-account",
            {
              email: email.trim(),
              otp: otpCode,
            }
          );
          setOtp(otpCode);
          setShow(false);
        } catch (error: any) {
          setApiError(error.response?.data?.message || "Fail!");
          setOtpValues(["", "", "", "", "", ""]);
          const firstInput = document.getElementById("otp-0");
          firstInput?.focus();
        }
      } else if (context === "forgotPassword") {
        try {
          const { data } = await axios.post(
            "http://localhost:3069/auth/verify-otp",
            {
              email: email.trim(),
              otp: otpCode,
            }
          );
          setOtp(otpCode);
          setShow(false);
          onSuccess(); // mở NewPasswordModal
        } catch (error: any) {
          setApiError(error.response?.data?.message || "Fail!");
          setOtpValues(["", "", "", "", "", ""]);
          const firstInput = document.getElementById("otp-0");
          firstInput?.focus();
        }
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        setApiError(
          error.response.data.message || "OTP không hợp lệ hoặc hết hạn!"
        );
        // reset ô nhập OTP để nhập lại
        setOtpValues(["", "", "", "", "", ""]);
        // focus input đầu tiên
        const firstInput = document.getElementById("otp-0");
        firstInput?.focus();
      } else {
        setApiError("Đã có lỗi xảy ra. Vui lòng thử lại.");
      }
    } finally {
      // setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);
      if (apiError) setApiError("");

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;

    // setLoading(true);
    setApiError("");
    try {
      const { data } = await axios.post(
        "http://localhost:3069/auth/forgot-password",
        { email: email.trim() }
      );
    } catch (error: any) {
      if (error.response?.status === 400) {
        setApiError(
          error.response.data.message || "OTP không hợp lệ hoặc hết hạn!"
        );
        // reset ô nhập OTP để nhập lại
        setOtpValues(["", "", "", "", "", ""]);
        // focus input đầu tiên
        const firstInput = document.getElementById("otp-0");
        firstInput?.focus();
      } else {
        setApiError("Đã có lỗi xảy ra. Vui lòng thử lại.");
      }
    } finally {
      // setLoading(false);
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
            {apiError && (
              <p className="text-red-500 text-sm mb-4">{apiError}</p>
            )}
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
                    if (
                      e.key === "Backspace" &&
                      !otpValues[index] &&
                      index > 0
                    ) {
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
              <button
                className="text-[#3f9bda] text-sm font-medium hover:underline"
                onClick={handleResendOtp}
                // disabled={loading}
              >
                Resend OTP
                {/* {loading ? "Resending..." : "Resend OTP"} */}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
