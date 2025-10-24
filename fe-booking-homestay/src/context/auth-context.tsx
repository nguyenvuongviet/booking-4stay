"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import SignInModal from "@/components/auth/signin-modal";
import SignUpModal from "@/components/auth/signup-modal";
import ForgotPasswordModal from "@/components/auth/forgot-password-modal";
import OTPModal from "@/components/auth/otp-modal";
import NewPasswordModal from "@/components/auth/new-password-modal";
import { IUser } from "../models/User";
import { useRouter } from "next/navigation";
import { STORAGE_KEYS } from "@/constants";

interface AuthContextType {
  user: IUser | null;
  setUser: (user: IUser | null) => void;
  updateUser: (user: IUser) => void;
  logout: () => void;
  openSignIn: () => void;
  openSignUp: () => void;
  openForgotPassword: () => void;
  openOTP: () => void;
  closeAll: () => void;
  email: string;
  setEmail: (email: string) => void;
  otp: string;
  setOtp: (otp: string) => void;
  openNewPassword: () => void;
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
  const [user, setUser] = useState<IUser | null>(null);
  const router = useRouter();
  useEffect(() => {
    // Load khi mount
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.user) {
        setUser(parsed.user); // chỉ set user, giữ accessToken & refreshToken nguyên vẹn
      }
    }
  }, []);

  const updateUser = (newUser: IUser) => {
    setUser(newUser);

    const currentData = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || "{}"
    );
    const updatedData = {
      ...currentData,
      user: newUser,
    };
    localStorage.setItem(
      STORAGE_KEYS.CURRENT_USER,
      JSON.stringify(updatedData)
    );
  };

 const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  const role = user?.role;
  setUser(null);

  if (role === 1) {
    router.push("/admin/login");
  } else {
    router.push("/");
  }
};


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

  const openNewPassword = () => {
    closeAll();
    setShowNewPassword(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        updateUser,
        logout,
        openSignIn,
        openSignUp,
        openForgotPassword,
        closeAll,
        email,
        setEmail,
        openOTP,
        otp,
        setOtp,
        openNewPassword,
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
