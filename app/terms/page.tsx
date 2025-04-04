import Link from "next/link"
import { BookOpen } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function TermsPage() {
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
      <main className="flex-1 container py-12">
        <div
          className="max-w-3xl mx-auto animate-fade-up"
          style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
        >
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the SkillSwap platform, you agree to be bound by these Terms of Service. If you do
                not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">2. User Accounts</h2>
              <p>
                To use certain features of SkillSwap, you must register for an account. You are responsible for
                maintaining the confidentiality of your account information and for all activities that occur under your
                account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">3. User Conduct</h2>
              <p>
                You agree to use SkillSwap only for lawful purposes and in accordance with these Terms. You agree not
                to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Use the platform in any way that violates applicable laws or regulations</li>
                <li>Impersonate any person or entity</li>
                <li>Engage in any activity that interferes with or disrupts the services</li>
                <li>Attempt to gain unauthorized access to any part of the platform</li>
                <li>Use the platform to transmit any malware or viruses</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">4. Content</h2>
              <p>
                Users are solely responsible for the content they post on SkillSwap. By posting content, you grant
                SkillSwap a non-exclusive, royalty-free license to use, display, and distribute your content in
                connection with the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">5. Skill Exchanges</h2>
              <p>
                SkillSwap facilitates connections between users for skill exchanges but is not responsible for the
                quality, safety, or legality of the skills exchanged. Users engage in skill exchanges at their own risk.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">6. Termination</h2>
              <p>
                SkillSwap reserves the right to terminate or suspend your account at any time for any reason without
                notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">7. Changes to Terms</h2>
              <p>
                SkillSwap may modify these Terms at any time. Your continued use of the platform after any changes
                indicates your acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">8. Disclaimer of Warranties</h2>
              <p>The platform is provided "as is" without warranties of any kind, either express or implied.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">9. Limitation of Liability</h2>
              <p>
                SkillSwap shall not be liable for any indirect, incidental, special, consequential, or punitive damages
                resulting from your use of or inability to use the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">10. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction],
                without regard to its conflict of law provisions.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t">
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SkillSwap. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-primary underline underline-offset-4">
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

