"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
// import "../auth.css"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    showPassword: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Register:", formData)
    // Redirect to OTP page
    window.location.href = "/auth/otp"
  }

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <Card className="auth-card">
          <CardContent className="auth-card-content">
            {/* Header */}
            <div className="auth-header">
              <h2 className="auth-title-blue">Sign up</h2>
              <Link href="/">
                <Button variant="ghost" size="icon" className="close-btn">
                  <X className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Name Fields */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First name</label>
                  <Input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="auth-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last name</label>
                  <Input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="auth-input"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label">Your email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="auth-input"
                  required
                />
              </div>

              {/* Mobile */}
              <div className="form-group">
                <label className="form-label">Your mobile phone number</label>
                <Input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="auth-input"
                  required
                />
              </div>

              {/* Password Fields */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="password-input-wrapper">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="auth-input password-input"
                      required
                      minLength={8}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm your password</label>
                  <div className="password-input-wrapper">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="auth-input password-input"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Password Requirements */}
              <p className="password-hint">Use 8 or more characters with a mix of letters, numbers & symbols</p>

              {/* Show Password Checkbox */}
              <div className="checkbox-wrapper">
                <Checkbox
                  id="showPassword"
                  checked={formData.showPassword}
                  onCheckedChange={(checked) => setFormData({ ...formData, showPassword: checked as boolean })}
                />
                <label htmlFor="showPassword" className="checkbox-label">
                  Show password
                </label>
              </div>

              {/* Sign Up Button */}
              <Button type="submit" className="auth-primary-btn">
                Sign up
              </Button>
            </form>

            {/* Footer Links */}
            <div className="auth-footer-links-center">
              <span className="auth-text">
                Already have an account?{" "}
                <Link href="/auth/login" className="auth-link">
                  Sign in
                </Link>
              </span>
            </div>

            {/* Divider */}
            <div className="auth-divider">
              <span>OR</span>
            </div>

            {/* Google Sign In */}
            <Button variant="outline" className="google-btn bg-transparent">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}