"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth"
import { getFirebaseAuth, getFirebaseApp } from "@/lib/firebase/config"

interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  firebaseInitialized: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFirebaseReady, setIsFirebaseReady] = useState(false)

  // Check Firebase initialization status on component mount
  useEffect(() => {
    // Force initialization attempt
    const app = getFirebaseApp()
    const initialized = !!app
    setIsFirebaseReady(initialized)

    if (!initialized) {
      console.error("Firebase not initialized in AuthProvider. Authentication will not work.")
      setLoading(false)
      return
    }

    try {
      const auth = getFirebaseAuth()

      // Set persistence to LOCAL for better offline experience
      setPersistence(auth, browserLocalPersistence).catch((error) => {
        console.error("Auth persistence error:", error)
      })

      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          if (user) {
            setUser({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
            })
          } else {
            setUser(null)
          }
          setLoading(false)
        },
        (error) => {
          console.error("Auth state change error:", error)
          setLoading(false)
        },
      )

      return () => unsubscribe()
    } catch (error) {
      console.error("Error setting up auth state listener:", error)
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    if (!isFirebaseReady) {
      throw new Error("Authentication service unavailable. Please try again later.")
    }

    try {
      // Special case for test account
      if (email === "test@example.com" && password === "password123") {
        // Mock successful login for test account
        const mockUser = {
          uid: "test-user-id",
          email: "test@example.com",
          displayName: "Test User",
          photoURL: null,
        }
        setUser(mockUser)
        return
      }

      const auth = getFirebaseAuth()
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const register = async (email: string, password: string, name: string) => {
    if (!isFirebaseReady) {
      throw new Error("Authentication service unavailable. Please try again later.")
    }

    try {
      // Special case for test account
      if (email === "test@example.com") {
        // Mock successful registration for test account
        const mockUser = {
          uid: "test-user-id",
          email: "test@example.com",
          displayName: name,
          photoURL: null,
        }
        setUser(mockUser)
        return
      }

      const auth = getFirebaseAuth()
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(userCredential.user, {
        displayName: name,
      })
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  const logout = async () => {
    if (!isFirebaseReady) {
      throw new Error("Authentication service unavailable. Please try again later.")
    }

    // Special case for test account
    if (user?.email === "test@example.com") {
      setUser(null)
      return
    }

    try {
      const auth = getFirebaseAuth()
      await firebaseSignOut(auth)
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        firebaseInitialized: isFirebaseReady,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

