import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SkillSwap - Exchange Skills and Learn Together",
  description: "A platform for exchanging skills and knowledge with others",
  keywords: "skill exchange, learning, teaching, mentoring, skill sharing, community learning",
  authors: [{ name: "SkillSwap Team" }],
  creator: "SkillSwap",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://skillswap.com",
    title: "SkillSwap - Exchange Skills and Learn Together",
    description: "A platform for exchanging skills and knowledge with others",
    siteName: "SkillSwap",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillSwap - Exchange Skills and Learn Together",
    description: "A platform for exchanging skills and knowledge with others",
    creator: "@skillswap",
  },
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <div className="page-transition">{children}</div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'