"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, X } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import api from "@/lib/request"

interface ForgotPasswordModalProps {
  show: boolean;
  setShow: (show: boolean) => void;
  switchToOTP: (show: boolean) => void;
}

export default function ForgotPasswordModal({
  show,
  setShow,
  switchToOTP,
}: ForgotPasswordModalProps) {
  const [error, setError] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [apiError, setApiError] = useState("");
  // const [loading, setLoading] = useState(false);
  const { setEmail } = useAuth(); // lấy từ context

  useEffect(() => {
    setEmailInput("");
    setError("");
    setApiError("");
  }, [show]);

  if (!show) return null;

  const validateEmail = (email: string) => {
    // Regex đơn giản: có ký tự trước @, có @, có domain sau @
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleContinue = async () => {
    if (!emailInput) {
      setError("Vui lòng nhập email trước khi tiếp tục");
      return;
    }
    if (!validateEmail(emailInput)) {
      setError("Email không hợp lệ. Vui lòng nhập đúng định dạng.");
      return;
    }
    setApiError("");
    // setLoading(true);
    try {
      const { data } = await api.post(
        "/auth/forgot-password",
        {
          email: emailInput.trim(),
        }
      );
      setEmail(emailInput);
      setError("");
      setShow(false); // đóng modal forgot password
      switchToOTP(true); // mở modal OTP
    } catch (error: any) {
      if (error.response) {
        setApiError(error.response.data.message || "Sign up failed!");
      } else {
        setApiError("Something went wrong. Please try again.");
      }
    } finally {
      // setLoading(false);
    }
  };

  return (
    <>
      {/* Modal */}
      {show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-[#3f9bda]">
                Forgot Password
              </h2>
              <button
                onClick={() => setShow(false)}
                className="text-[#667085] hover:text-[#344054]"
              >
                <X size={24} />
              </button>
            </div>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault(); // ngăn reload
                handleContinue();
              }}
            >
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
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className={`mt-1 border-[#d0d5dd] focus:border-[#3f9bda] focus:ring-[#3f9bda] ${
                    error ? "border-red-500" : ""
                  }`}
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>
              {apiError && (
                <p className="text-red-500 text-sm mb-4">{apiError}</p>
              )}
              <Button
                className="w-full bg-[#3f9bda] hover:bg-[#2980b9] text-white py-3"
                onClick={handleContinue}
              >
                Send OTP
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
