import Link from "next/link"
import { BookOpen, Users, Lightbulb, Heart } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function AboutPage() {
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
            <Link href="/how-it-works" className="text-sm font-medium hover:underline underline-offset-4">
              How It Works
            </Link>
            <Link href="/about" className="text-sm font-medium text-primary underline underline-offset-4">
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
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">About SkillSwap</h1>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Connecting people through knowledge exchange
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <div
                className="space-y-4 animate-fade-right"
                style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}
              >
                <h2 className="text-3xl font-bold tracking-tighter">Our Mission</h2>
                <p className="text-muted-foreground md:text-lg">
                  At SkillSwap, we believe that everyone has something valuable to teach and something new to learn. Our
                  mission is to create a platform where people can exchange skills and knowledge directly with each
                  other, fostering a community of continuous learning and growth.
                </p>
                <p className="text-muted-foreground md:text-lg">
                  We're dedicated to breaking down barriers to education and making skill acquisition accessible to
                  everyone, regardless of background or resources.
                </p>
              </div>
              <div
                className="flex justify-center lg:justify-end animate-fade-left"
                style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
              >
                <div className="relative w-full max-w-[500px] aspect-square rounded-xl overflow-hidden border shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lightbulb className="h-24 w-24 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
              <h2
                className="text-3xl font-bold tracking-tighter animate-fade-up"
                style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}
              >
                Our Values
              </h2>
            </div>
            <div
              className="grid gap-8 md:grid-cols-3 animate-fade-up"
              style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}
            >
              <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg bg-background hover:shadow-md transition-shadow">
                <div className="p-3 rounded-full bg-primary/10">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Community</h3>
                <p className="text-muted-foreground text-center">
                  We foster a supportive community where members can connect, share, and grow together.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg bg-background hover:shadow-md transition-shadow">
                <div className="p-3 rounded-full bg-primary/10">
                  <Lightbulb className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Knowledge</h3>
                <p className="text-muted-foreground text-center">
                  We believe in the power of knowledge sharing and lifelong learning for personal growth.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg bg-background hover:shadow-md transition-shadow">
                <div className="p-3 rounded-full bg-primary/10">
                  <Heart className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Inclusivity</h3>
                <p className="text-muted-foreground text-center">
                  We're committed to creating an inclusive platform accessible to people from all backgrounds.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div
                className="space-y-2 animate-fade-up"
                style={{ animationDelay: "0.7s", animationFillMode: "forwards" }}
              >
                <h2 className="text-3xl font-bold tracking-tighter">Join Our Community</h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Start exchanging skills and growing your knowledge today
                </p>
              </div>
              <div
                className="flex flex-col gap-2 min-[400px]:flex-row pt-4 animate-fade-up"
                style={{ animationDelay: "0.8s", animationFillMode: "forwards" }}
              >
                <Link href="/register">
                  <Button size="lg" className="w-full min-[400px]:w-auto">
                    Get Started
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

