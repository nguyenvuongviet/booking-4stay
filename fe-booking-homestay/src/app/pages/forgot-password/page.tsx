"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { X, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import "../auth.css"

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const emailValue = formData.get("email") as string
    console.log("Reset password for:", emailValue)
    setEmail(emailValue)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="auth-container">
        <div className="auth-wrapper">
          <Card className="auth-card">
            <CardContent className="auth-card-content">
              <div className="success-content">
                <div className="success-icon">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h2 className="auth-title">Check your email</h2>
                <p className="success-description">
                  We've sent a password reset link to <br />
                  <strong>{email}</strong>
                </p>
                <Link href="/auth/login">
                  <Button className="auth-primary-btn">Back to Sign in</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <Card className="auth-card">
          <CardContent className="auth-card-content">
            {/* Header */}
            <div className="auth-header">
              <Link href="/auth/login">
                <Button variant="ghost" size="icon" className="back-btn">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h2 className="auth-title">Reset Password</h2>
              <Link href="/">
                <Button variant="ghost" size="icon" className="close-btn">
                  <X className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="forgot-description">
              <p className="auth-text">Enter your email address and we'll send you a link to reset your password.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Your email</label>
                <Input type="email" name="email" className="auth-input" required />
              </div>

              <Button type="submit" className="auth-primary-btn">
                Send Reset Link
              </Button>
            </form>

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
