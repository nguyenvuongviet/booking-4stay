"use client";

import NewPasswordModal from "@/_components/auth/new-password-modal";
import OTPModal from "@/_components/auth/otp-modal";
import SignInModal from "@/_components/auth/signin-modal";
import SignUpModal from "@/_components/auth/signup-modal";
import { STORAGE_KEYS } from "@/constants";
import { IUser } from "@/models/User";
import api from "@/services/api";
import { get_profile, login } from "@/services/authApi";
import { deletePushSubscriptions } from "@/services/chatApi";
import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface AuthContextType {
  user: IUser | null;
  setUser: (user: IUser | null) => void;
  updateUser: (user: IUser) => void;
  logout: () => Promise<void>;
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
  refreshUser: () => Promise<void>;
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

  const updateUser = useCallback((newUser: IUser) => {
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
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await get_profile();
      if (res?.data) {
        updateUser(res.data);
      }
    } catch (error) {
      console.error("Refresh user error:", error);
    }
  }, [updateUser]);

  const logout = async () => {
    try {
      await deletePushSubscriptions();
    } catch (error) {
      console.warn("Delete push subscriptions error:", error);
    }

    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        const subscription = await registration?.pushManager.getSubscription();
        await subscription?.unsubscribe();
      }
    } catch (error) {
      console.warn("Browser push unsubscribe error:", error);
    }

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

  const contextValue = useMemo(() => ({
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
    refreshUser,
  }), [
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
    refreshUser,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
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
