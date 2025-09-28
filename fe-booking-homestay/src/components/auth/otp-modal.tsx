"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import {
  active_account,
  forgot_password,
  verify_otp,
} from "@/services/authApi";

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
          const { data } = await active_account({
            email: email.trim(),
            otp: otpCode,
          });
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
          const { data } = await verify_otp({
            email: email.trim(),
            otp: otpCode,
          });
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
      const { data } = await forgot_password({ email: email.trim() });
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
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-8 w-full max-w-md mx-4 shadow-2xl">
            <div className="text-center mb-4">
              <span className="text-xl text-foreground elegant-heading">
                4Stay
              </span>
              <span className="text-3xl elegant-heading text-primary">
                Enter OTP
              </span>{" "}
              <div className="flex justify-end">
                <button
                  onClick={() => setShow(false)}
                  className="text-primary hover:text-primary/80"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            {apiError && (
              <p className="text-destructive text-sm mb-4">{apiError}</p>
            )}
            <p className="text-foreground elegant-subheading mb-6">
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
                  className="w-12 h-12 text-center text-xl font-semibold border border-border rounded-lg focus:outline-none"
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
            {error && <p className="text-destructive text-sm mb-4">{error}</p>}

            <Button
              className="mb-4 rounded-2xl w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 elegant-subheading text-md"
              onClick={handleVerify}
            >
              Verify OTP
            </Button>

            <div className="text-center">
              <span className="text-muted-foreground elegant-subheading text-sm">
                Didn't receive code?{" "}
              </span>
              <button
                className="text-primary elegant-heading text-base hover:underline"
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
