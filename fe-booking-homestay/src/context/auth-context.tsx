"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import SignInModal from "@/components/auth/signin-modal";
import SignUpModal from "@/components/auth/signup-modal";
import ForgotPasswordModal from "@/components/auth/forgot-password-modal";
import OTPModal from "@/components/auth/otp-modal";
import NewPasswordModal from "@/components/auth/new-password-modal";

interface AuthContextType {
  openSignIn: () => void;
  openSignUp: () => void;
  openForgotPassword: () => void;
  openOTP: () => void;
  closeAll: () => void;
  email: string;
  setEmail: (email: string) => void;
  otp: string;
  setOtp: (otp: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpContext, setOtpContext] = useState<"signup" | "forgotPassword">(
    "signup"
  );

  const closeAll = () => {
    setShowSignIn(false);
    setShowSignUp(false);
    setShowForgotPassword(false);
    setShowOTP(false);
    setShowNewPassword(false);
  };

  const openSignIn = () => {
    closeAll();
    setShowSignIn(true);
  };

  const openSignUp = () => {
    closeAll();
    setShowSignUp(true);
  };

  const openForgotPassword = () => {
    closeAll();
    setShowForgotPassword(true);
  };

  const openOTP = () => {
    closeAll();
    setShowOTP(true);
  };

  return (
    <AuthContext.Provider
      value={{
        openSignIn,
        openSignUp,
        openForgotPassword,
        closeAll,
        email,
        setEmail,
        openOTP,
        otp,
        setOtp,
      }}
    >
      {children}

      {/* Modals */}
      <SignInModal
        show={showSignIn}
        setShow={setShowSignIn}
        switchToSignUp={openSignUp}
        switchToForgotPassword={openForgotPassword}
      />

      <SignUpModal
        show={showSignUp}
        setShow={setShowSignUp}
        switchToSignIn={openSignIn}
        switchToOTP={() => {
          setOtpContext("signup");
          closeAll();
          setShowOTP(true);
        }}
      />

      <ForgotPasswordModal
        show={showForgotPassword}
        setShow={setShowForgotPassword}
        switchToOTP={() => {
          setOtpContext("forgotPassword");
          closeAll();
          setShowOTP(true);
        }}
      />

      <OTPModal
        show={showOTP}
        setShow={setShowOTP}
        context={otpContext}
        onSuccess={() => {
          if (otpContext === "forgotPassword") {
            closeAll();
            setShowNewPassword(true);
          }
        }}
      />

      <NewPasswordModal show={showNewPassword} setShow={setShowNewPassword} />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
