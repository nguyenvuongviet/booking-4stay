"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Logo } from "@/components/ui/logo"
import Link from "next/link"
import "../auth.css"

export default function OTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [countdown, setCountdown] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("OTP:", otp.join(""))
    window.location.href = "/"
  }

  const handleResendOTP = () => {
    setCountdown(60)
    setOtp(["", "", "", "", "", ""])
    inputRefs.current[0]?.focus()
  }

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <Card className="auth-card">
          <CardContent className="auth-card-content">
            {/* Logo */}
            <div className="otp-logo">
              <Logo size="lg" showText={false} />
            </div>

            {/* Header */}
            <div className="otp-header">
              <h2 className="auth-title">Enter OTP</h2>
              <p className="otp-description">We have sent a OTP to your email/mobile number</p>
            </div>

            <form onSubmit={handleSubmit} className="otp-form">
              {/* OTP Input */}
              <div className="otp-inputs">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="otp-input"
                  />
                ))}
              </div>

              {/* Submit Button */}
              <Button type="submit" className="auth-primary-btn" disabled={otp.some((digit) => !digit)}>
                Sign in
              </Button>
            </form>

            {/* Resend OTP */}
            <div className="otp-resend">
              <span className="auth-text">
                Didn't receive code?{" "}
                {countdown > 0 ? (
                  <span className="countdown-text">Resend in {countdown}s</span>
                ) : (
                  <button onClick={handleResendOTP} className="resend-btn">
                    Resend OTP
                  </button>
                )}
              </span>
            </div>

            {/* Back to Login */}
            <div className="back-to-login">
              <Link href="/auth/login" className="back-link">
                Back to Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
