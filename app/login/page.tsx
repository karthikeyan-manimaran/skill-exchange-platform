"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookOpen, Eye, EyeOff, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function SignInPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { login, firebaseInitialized } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  async function onSubmit(data: LoginFormValues) {
    if (!isOnline) {
      toast({
        variant: "destructive",
        title: "You're offline",
        description: "Please check your internet connection and try again.",
      })
      return
    }

    if (!firebaseInitialized) {
      toast({
        variant: "destructive",
        title: "Service unavailable",
        description: "Authentication service is currently unavailable. Please try again later.",
      })
      return
    }

    setIsLoading(true)
    try {
      await login(data.email, data.password)
      router.push("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      let errorMessage = "Invalid email or password. Please try again."

      if (error instanceof Error) {
        errorMessage = error.message

        if (errorMessage.includes("auth/user-not-found") || errorMessage.includes("auth/wrong-password")) {
          errorMessage = "Invalid email or password. Please try again."
        } else if (errorMessage.includes("auth/too-many-requests")) {
          errorMessage = "Too many failed login attempts. Please try again later."
        } else if (errorMessage.includes("auth/configuration-not-found")) {
          errorMessage = "Authentication service is currently unavailable. Please try again later."
        } else if (errorMessage.includes("Firebase not initialized")) {
          errorMessage = "Authentication service is currently unavailable. Please try again later."
        } else if (errorMessage.includes("network-request-failed")) {
          errorMessage = "Network error. Please check your internet connection and try again."
        }
      }

      toast({
        variant: "destructive",
        title: "Login failed",
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/5 dark:to-accent/5 p-4">
      <Link href="/" className="absolute left-8 top-8 flex items-center gap-2 font-bold text-xl">
        <BookOpen className="h-6 w-6 text-primary" />
        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">SkillSwap</span>
      </Link>

      <Card
        className="w-full max-w-md animate-fade-up shadow-xl bg-card/95 backdrop-blur-sm border-0"
        style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg blur opacity-10"></div>
        <CardHeader className="space-y-1 relative">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Sign in to your account
          </CardTitle>
          <CardDescription>Enter your credentials to access your SkillSwap account</CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                        className="hover:border-primary focus:border-primary transition-colors"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          {...field}
                          className="hover:border-primary focus:border-primary transition-colors"
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300"
                disabled={isLoading || !isOnline}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  href="/sign-up"
                  className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}

