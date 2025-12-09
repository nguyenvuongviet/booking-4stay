"use client";

import NewPasswordModal from "@/components/auth/new-password-modal";
import OTPModal from "@/components/auth/otp-modal";
import SignInModal from "@/components/auth/signin-modal";
import SignUpModal from "@/components/auth/signup-modal";
import { STORAGE_KEYS } from "@/constants";
import { IUser } from "@/models/User";
import api from "@/services/api";
import { login } from "@/services/authApi";
import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: IUser | null;
  setUser: (user: IUser | null) => void;
  updateUser: (user: IUser) => void;
  logout: () => void;
  openSignIn: () => void;
  openSignUp: () => void;
  openOTP: () => void;
  closeAll: () => void;
  email: string;
  setEmail: (email: string) => void;
  otp: string;
  setOtp: (otp: string) => void;
  password: string;
  setPassword: (password: string) => void;
  openNewPassword: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<IUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.user) setUser(parsed.user);
    } catch (err) {
      console.warn("Invalid user in storage → removed");
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, []);

  const updateUser = (newUser: IUser) => {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    let parsed: any = {};
    try {
      parsed = raw ? JSON.parse(raw) : {};
    } catch { }
    const updated = {
      ...parsed,
      user: newUser,
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    setUser(null);
    api.defaults.headers.Authorization = "";
    router.push("/");
    router.refresh();
  };

  const closeAll = () => {
    setShowSignIn(false);
    setShowSignUp(false);
    setShowNewPassword(false);
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
        closeAll,
        email,
        setEmail,
        openOTP,
        otp,
        setOtp,
        password,
        setPassword,
        openNewPassword,
      }}
    >
      {children}

      <SignInModal
        show={showSignIn}
        setShow={setShowSignIn}
        switchToSignUp={openSignUp}
        switchToForgotPassword={openNewPassword}
      />

      <SignUpModal
        show={showSignUp}
        setShow={setShowSignUp}
        switchToSignIn={openSignIn}
        switchToOTP={() => {
          closeAll();
          setShowOTP(true);
        }}
      />

      <OTPModal
        show={showOTP}
        setShow={setShowOTP}
        context="signup"
        onSuccess={async () => {
          const { data } = await login({ email, password });

          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(data));

          updateUser(data.user);
          router.push("/");
        }}
      />

      <NewPasswordModal show={showNewPassword} setShow={setShowNewPassword} />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
