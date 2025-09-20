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
import api from "../lib/request";
import { IUser } from "../models/User";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: IUser | null;
  login: (email: string, password: string) => Promise<void>;
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

  // ✅ Nếu F5 lại, lấy user từ localStorage (nếu muốn thì lưu user ở localStorage luôn)
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Mỗi khi user thay đổi, cập nhật vào localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    const { accessToken, refreshToken, user } = res.data.data;

    // Lưu token
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));
    // Set user ngay từ response
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
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
        login,
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
