import Link from "next/link"
import { BookOpen, UserPlus, Search, Calendar, MessageSquare, Star } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <BookOpen className="h-6 w-6" />
            <span>SkillSwap</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/explore" className="text-sm font-medium hover:underline underline-offset-4">
              Explore
            </Link>
            <Link href="/how-it-works" className="text-sm font-medium text-primary underline underline-offset-4">
              How It Works
            </Link>
            <Link href="/about" className="text-sm font-medium hover:underline underline-offset-4">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Register</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div
                className="space-y-2 animate-fade-up"
                style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
              >
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">How SkillSwap Works</h1>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Exchange skills and knowledge in three simple steps
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 md:grid-cols-3">
              <div
                className="flex flex-col items-center text-center space-y-4 animate-fade-up"
                style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <UserPlus className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold">1. Create Your Profile</h2>
                <p className="text-muted-foreground">
                  Sign up and create your profile. List the skills you can teach and the ones you want to learn. The
                  more detailed your profile, the better matches you'll find.
                </p>
              </div>
              <div
                className="flex flex-col items-center text-center space-y-4 animate-fade-up"
                style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Search className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold">2. Find Matches</h2>
                <p className="text-muted-foreground">
                  Our system will find people who are looking for your skills or offering what you want to learn. Browse
                  through potential matches and connect with those who interest you.
                </p>
              </div>
              <div
                className="flex flex-col items-center text-center space-y-4 animate-fade-up"
                style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Calendar className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold">3. Start Exchanging</h2>
                <p className="text-muted-foreground">
                  Schedule sessions with your matches and start exchanging skills. Learn new things while teaching what
                  you know, creating a mutually beneficial relationship.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2
                className="text-3xl font-bold tracking-tighter animate-fade-up"
                style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}
              >
                The SkillSwap Experience
              </h2>
            </div>
            <div className="grid gap-10 lg:grid-cols-2 items-center">
              <div
                className="space-y-6 animate-fade-right"
                style={{ animationDelay: "0.7s", animationFillMode: "forwards" }}
              >
                <div className="flex gap-4 items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Direct Communication</h3>
                    <p className="text-muted-foreground">
                      Message your matches directly through our platform to discuss your skill exchange and set up
                      sessions.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Scheduling System</h3>
                    <p className="text-muted-foreground">
                      Use our built-in scheduling system to book sessions with your matches at times that work for both
                      of you.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Feedback and Ratings</h3>
                    <p className="text-muted-foreground">
                      After sessions, leave feedback and ratings to help build a trusted community of skill exchangers.
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="flex justify-center lg:justify-end animate-fade-left"
                style={{ animationDelay: "0.8s", animationFillMode: "forwards" }}
              >
                <div className="relative w-full max-w-[500px] aspect-square rounded-xl overflow-hidden border shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MessageSquare className="h-24 w-24 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div
                className="space-y-2 animate-fade-up"
                style={{ animationDelay: "0.9s", animationFillMode: "forwards" }}
              >
                <h2 className="text-3xl font-bold tracking-tighter">Ready to Start?</h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join SkillSwap today and start your skill exchange journey
                </p>
              </div>
              <div
                className="flex flex-col gap-2 min-[400px]:flex-row pt-4 animate-fade-up"
                style={{ animationDelay: "1s", animationFillMode: "forwards" }}
              >
                <Link href="/register">
                  <Button size="lg" className="w-full min-[400px]:w-auto">
                    Create Account
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button size="lg" variant="outline" className="w-full min-[400px]:w-auto">
                    Explore Skills
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SkillSwap. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline underline-offset-4">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline underline-offset-4">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

