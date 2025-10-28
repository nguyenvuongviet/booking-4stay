"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { forgot_password } from "@/services/authApi";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

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
      const { data } = await forgot_password({ email: emailInput.trim() });
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
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-end">
              <button
                onClick={() => setShow(false)}
                className="text-primary hover:text-primary/80"
              >
                <X size={24} />
              </button>
            </div>

            <div className="text-center mb-4">
              <h2 className="text-3xl elegant-heading text-primary">
                Forgot password
              </h2>
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
                  className="text-foreground elegant-subheading"
                >
                  Your email
                </Label>
                <Input
                  id="signupEmail"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className={`bg-input rounded-2xl mt-1 mb-2 ${
                    error ? "border-destructive" : ""
                  }`}
                />
                {error && (
                  <p className="text-destructive text-sm mt-1">{error}</p>
                )}
              </div>
              {apiError && (
                <p className="text-destructive text-sm mb-4">{apiError}</p>
              )}
              <Button
                className="mt-4 mb-6 rounded-2xl w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 elegant-subheading text-md"
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
