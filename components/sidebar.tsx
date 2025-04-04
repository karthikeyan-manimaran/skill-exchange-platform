"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Home, Search, MessageSquare, Calendar, User, Settings, Menu, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const routes = [
    {
      icon: Home,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: Search,
      label: "Explore",
      href: "/explore",
    },
    {
      icon: MessageSquare,
      label: "Messages",
      href: "/messages",
    },
    {
      icon: Calendar,
      label: "Bookings",
      href: "/bookings",
    },
    {
      icon: User,
      label: "Profile",
      href: "/profile",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/settings",
    },
  ]

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-primary text-white p-2 rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border shadow-lg transition-transform duration-300 ease-in-out",
          "md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">SkillSwap</span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  "hover:bg-muted",
                  pathname === route.href ? "bg-primary text-primary-foreground" : "text-foreground",
                )}
              >
                <route.icon className="h-5 w-5" />
                <span>{route.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} SkillSwap</div>
          </div>
        </div>
      </div>
    </>
  )
}

