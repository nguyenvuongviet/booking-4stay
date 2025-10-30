"use client";

import Loader from "@/components/loader/Loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { STORAGE_KEYS } from "@/constants";
import { login } from "@/services/authApi";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const emailTrim = email.trim();
    const pwdTrim = password.trim();
    if (!emailTrim || !pwdTrim) {
      toast({
        variant: "destructive",
        title: "Thiếu thông tin",
        description: "Vui lòng nhập đầy đủ Email và Mật khẩu.",
        duration: 5000,
      });
      return;
    }

    try {
      setIsLoading(true);

      const { data } = await login({ email: emailTrim, password: pwdTrim });
      const { accessToken, refreshToken, user } = data || {};
      if (!accessToken || !user) throw new Error("Đăng nhập thất bại");

      localStorage.setItem(
        STORAGE_KEYS.CURRENT_USER,
        JSON.stringify({ accessToken, refreshToken, user })
      );

      toast({
        variant: "success",
        title: "Đăng nhập thành công",
        description: `Chào mừng ${
          user.firstName + " " + user.lastName || user.email
        }!`,
        duration: 1000,
      });

      const next = params.get("next") || "/admin";
      router.replace(next);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Đăng nhập thất bại, vui lòng thử lại.";

      toast({
        variant: "destructive",
        title: "Đăng nhập thất bại",
        description: message,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/4stay-logo.png"
            alt="4Stay"
            width={100}
            height={100}
            priority
          />
          <h1 className="text-xl font-semibold tracking-tight">4Stay Admin</h1>
          <p className="text-sm text-muted-foreground">
            Đăng nhập để quản trị hệ thống
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-input"
                disabled={isLoading}
              />
              <span className="text-muted-foreground">Remember me</span>
            </label>
            <a href="#" className="text-primary hover:underline">
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader />
                <span>Signing in...</span>
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-xs font-semibold text-muted-foreground mb-2">
            Demo Credentials:
          </p>
          <p className="text-xs text-muted-foreground">
            Email: admin@example.com
          </p>
          <p className="text-xs text-muted-foreground">Password: password123</p>
        </div>
      </Card>
    </div>
  );
}
