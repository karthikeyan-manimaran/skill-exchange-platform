"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { sendPasswordResetEmail } from "firebase/auth"
import { getFirebaseAuth } from "@/lib/firebase/config"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setMessage({
        type: "error",
        text: "Please enter your email address.",
      })
      return
    }

    setIsLoading(true)
    setMessage({ type: "", text: "" })

    try {
      const auth = getFirebaseAuth()
      await sendPasswordResetEmail(auth, email)

      setMessage({
        type: "success",
        text: "Password reset email sent! Check your inbox for further instructions.",
      })

      setEmail("")
    } catch (error) {
      console.error("Error sending password reset email:", error)

      if (error instanceof Error) {
        const errorCode = error.message || ""

        if (errorCode.includes("auth/user-not-found")) {
          setMessage({
            type: "error",
            text: "No account found with this email address.",
          })
        } else if (errorCode.includes("auth/invalid-email")) {
          setMessage({
            type: "error",
            text: "Invalid email address. Please check your email.",
          })
        } else {
          setMessage({
            type: "error",
            text: "Failed to send password reset email. Please try again later.",
          })
        }
      } else {
        setMessage({
          type: "error",
          text: "An unexpected error occurred. Please try again.",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-description">Enter your email to receive a password reset link</p>
        </div>

        <div className="auth-body">
          {message.text && <div className={`auth-message ${message.type}`}>{message.text}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </div>

        <div className="auth-footer">
          <p>
            Remember your password?{" "}
            <Link href="/login" className="auth-link">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

