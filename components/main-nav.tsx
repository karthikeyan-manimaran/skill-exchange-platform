import Link from "next/link"
import { BookOpen } from "lucide-react"

export function MainNav() {
  return (
    <div className="flex items-center gap-6">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl group">
        <BookOpen className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">SkillSwap</span>
      </Link>
      <nav className="hidden md:flex items-center gap-6">
        <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors duration-300">
          Dashboard
        </Link>
        <Link href="/explore" className="text-sm font-medium hover:text-primary transition-colors duration-300">
          Explore
        </Link>
        <Link href="/messages" className="text-sm font-medium hover:text-primary transition-colors duration-300">
          Messages
        </Link>
        <Link href="/bookings" className="text-sm font-medium hover:text-primary transition-colors duration-300">
          Bookings
        </Link>
        <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors duration-300">
          About
        </Link>
        <Link href="/how-it-works" className="text-sm font-medium hover:text-primary transition-colors duration-300">
          How It Works
        </Link>
      </nav>
    </div>
  )
}

