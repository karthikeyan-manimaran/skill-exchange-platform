import Link from "next/link"
import { ArrowRight, BookOpen, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2 font-bold text-xl">
            <BookOpen className="h-6 w-6" />
            <span>SkillSwap</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/explore" className="text-sm font-medium hover:underline underline-offset-4">
              Explore
            </Link>
            <Link href="/how-it-works" className="text-sm font-medium hover:underline underline-offset-4">
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
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div
                className="flex flex-col justify-center space-y-4 animate-fade-right"
                style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
              >
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Share Skills, Grow Together
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Connect with people who want to learn what you know, and teach what they know.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/register">
                    <Button size="lg" className="w-full min-[400px]:w-auto animate-pulse">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/explore">
                    <Button size="lg" variant="outline" className="w-full min-[400px]:w-auto">
                      Explore Skills
                    </Button>
                  </Link>
                </div>
              </div>
              <div
                className="flex justify-center lg:justify-end animate-fade-left"
                style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
              >
                <div className="relative w-full max-w-[500px] aspect-square rounded-xl overflow-hidden border shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Users className="h-24 w-24 text-primary animate-bounce" style={{ animationDuration: "3s" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div
              className="flex flex-col items-center justify-center space-y-4 text-center animate-fade-up"
              style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Popular Skills</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Discover the most sought-after skills on our platform
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
              {popularSkills.map((skill, index) => (
                <Card
                  key={skill.name}
                  className="flex flex-col hover:shadow-lg transition-all duration-300 animate-fade-up"
                  style={{ animationDelay: `${0.7 + index * 0.1}s`, animationFillMode: "forwards" }}
                >
                  <CardHeader>
                    <CardTitle>{skill.name}</CardTitle>
                    <CardDescription>{skill.category}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground">{skill.description}</p>
                  </CardContent>
                  <CardFooter>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="mr-1 h-3 w-3" />
                      <span>{skill.users} users</span>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <div
              className="flex justify-center mt-8 animate-fade-up"
              style={{ animationDelay: "1.3s", animationFillMode: "forwards" }}
            >
              <Link href="/explore">
                <Button variant="outline" className="hover:scale-105 transition-transform">
                  View All Skills
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div
              className="flex flex-col items-center justify-center space-y-4 text-center animate-fade-up"
              style={{ animationDelay: "1.4s", animationFillMode: "forwards" }}
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Three simple steps to start exchanging skills
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 mt-8">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center animate-fade-up"
                  style={{ animationDelay: `${1.5 + index * 0.1}s`, animationFillMode: "forwards" }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground hover:scale-110 transition-transform">
                    {index + 1}
                  </div>
                  <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
                  <p className="mt-2 text-muted-foreground">{step.description}</p>
                </div>
              ))}
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

const popularSkills = [
  {
    name: "Web Development",
    category: "Technology",
    description: "Learn to build modern websites and web applications using HTML, CSS, and JavaScript.",
    users: 1245,
  },
  {
    name: "Digital Photography",
    category: "Arts",
    description: "Master the art of taking stunning photos with any camera, including smartphone photography.",
    users: 876,
  },
  {
    name: "Spanish Language",
    category: "Languages",
    description: "Learn conversational Spanish for travel, work, or personal enrichment.",
    users: 1032,
  },
  {
    name: "Yoga Instruction",
    category: "Health & Fitness",
    description: "Learn to teach yoga poses, breathing techniques, and meditation practices.",
    users: 654,
  },
  {
    name: "Financial Planning",
    category: "Business",
    description: "Understand personal finance, investments, retirement planning, and budgeting.",
    users: 789,
  },
  {
    name: "Cooking",
    category: "Food",
    description: "Learn to prepare delicious meals from different cuisines with basic ingredients.",
    users: 1123,
  },
]

const steps = [
  {
    title: "Create Your Profile",
    description: "Sign up and list the skills you can teach and the ones you want to learn.",
  },
  {
    title: "Find Matches",
    description: "Our system will find people who are looking for your skills or offering what you want to learn.",
  },
  {
    title: "Start Exchanging",
    description: "Connect with your matches and start sharing knowledge through our platform.",
  },
]

