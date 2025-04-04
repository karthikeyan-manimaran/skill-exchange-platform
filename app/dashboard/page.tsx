"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MessageSquare, User, RefreshCw, Wifi, WifiOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { getUserProfile, getMatches } from "@/lib/firebase/firestore"
import type { UserProfile, Match } from "@/lib/types"
import { AppLayout } from "@/components/app-layout"

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [oneWayMatches, setOneWayMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true)
  const [error, setError] = useState<string | null>(null)
  const [offlineMode, setOfflineMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // If we were in offline mode and now we're back online, try to fetch data again
      if (offlineMode) {
        fetchData()
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [offlineMode])

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    setOfflineMode(false)

    try {
      if (!user) {
        throw new Error("User not authenticated")
      }

      const profile = await getUserProfile(user.uid)
      if (!profile) {
        router.push("/profile-setup")
        return
      }

      setUserProfile(profile)

      const matchesData = await getMatches(user.uid)
      setMatches(matchesData.twoWayMatches)
      setOneWayMatches(matchesData.oneWayMatches)

      // If we got here with mock data due to being offline, set offline mode
      if (!isOnline) {
        setOfflineMode(true)
      }
    } catch (error) {
      console.error("Error fetching data:", error)

      // Check if the error is related to being offline
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes("offline") || errorMessage.includes("network") || !isOnline) {
        setOfflineMode(true)
        // Try to get mock data
        try {
          const profile = await getUserProfile(user?.uid || "mock-user")
          if (profile) {
            setUserProfile(profile)
            const matchesData = await getMatches(user?.uid || "mock-user")
            setMatches(matchesData.twoWayMatches)
            setOneWayMatches(matchesData.oneWayMatches)
            setError(null) // Clear error if we got mock data
          } else {
            setError("Unable to load data. You appear to be offline.")
          }
        } catch (fallbackError) {
          setError("Failed to load data in offline mode.")
        }
      } else {
        setError("Failed to load your data. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push("/sign-in")
      return
    }

    fetchData()
  }, [user, loading, router])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  if (error && !userProfile) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6 bg-card rounded-xl shadow-lg animate-fade-up">
            <div className="mb-6">
              {isOnline ? (
                <Wifi className="h-12 w-12 text-destructive mx-auto" />
              ) : (
                <WifiOff className="h-12 w-12 text-destructive mx-auto" />
              )}
            </div>
            <h2 className="text-2xl font-bold mb-4">Connection Issue</h2>
            <p className="mb-6 text-muted-foreground">{error}</p>
            <Button
              onClick={fetchData}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
            <div className="mt-4">
              <Link href="/" className="text-sm text-primary hover:underline">
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout showSearch={true} searchPlaceholder="Search skills or users..." onSearch={handleSearch}>
      {offlineMode && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 py-2 px-4 rounded-md mb-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <WifiOff className="h-4 w-4 inline mr-2" />
              You're viewing cached data in offline mode. Some features may be limited.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              className="text-xs border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-800"
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Try Again
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/4">
          <Card className="hover:shadow-lg transition-all duration-300 animate-fade-up bg-card">
            <CardHeader>
              <CardTitle className="text-xl">{userProfile?.displayName}</CardTitle>
              <CardDescription>{userProfile?.location}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Skills I Offer</h3>
                <div className="flex flex-wrap gap-2">
                  {userProfile?.skillsOffered.map((skill, index) => (
                    <Badge
                      key={index}
                      className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 hover:-translate-y-1"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Skills I Want</h3>
                <div className="flex flex-wrap gap-2">
                  {userProfile?.skillsWanted.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="hover:bg-muted transition-all duration-300 hover:-translate-y-1"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="pt-2 space-y-2">
                <Link href="/profile">
                  <Button variant="outline" className="w-full hover:bg-muted transition-all duration-300">
                    <User className="mr-2 h-4 w-4" />
                    View Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-3/4">
          <Tabs defaultValue="matches" className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <TabsList className="grid w-full grid-cols-3 bg-muted/50 backdrop-blur-sm">
              <TabsTrigger
                value="matches"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground transition-all duration-300"
              >
                Matches
              </TabsTrigger>
              <TabsTrigger
                value="one-way"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground transition-all duration-300"
              >
                One-way Matches
              </TabsTrigger>
              <TabsTrigger
                value="explore"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground transition-all duration-300"
              >
                Explore
              </TabsTrigger>
            </TabsList>

            <TabsContent value="matches" className="mt-6">
              <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Your Skill Matches
              </h2>
              {matches.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {matches.map((match, index) => (
                    <MatchCard key={match.id} match={match} isTwoWay={true} delay={index * 0.1} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-card rounded-xl">
                  <p className="text-muted-foreground">
                    No matches found yet. Add more skills to increase your chances!
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="one-way" className="mt-6">
              <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                One-way Matches
              </h2>
              {oneWayMatches.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {oneWayMatches.map((match, index) => (
                    <MatchCard key={match.id} match={match} isTwoWay={false} delay={index * 0.1} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-card rounded-xl">
                  <p className="text-muted-foreground">No one-way matches found yet.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="explore" className="mt-6">
              <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Explore Users
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {exploreUsers.map((user, index) => (
                  <UserCard key={user.id} user={user} delay={index * 0.1} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  )
}

function MatchCard({ match, isTwoWay, delay = 0 }: { match: Match; isTwoWay: boolean; delay?: number }) {
  return (
    <Card
      className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-up bg-card"
      style={{ animationDelay: `${delay}s` }}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Avatar className="border-2 border-primary">
              <AvatarImage src={match.photoURL || "/placeholder.svg?height=40&width=40"} alt={match.displayName} />
              <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                {match.displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{match.displayName}</CardTitle>
              <CardDescription>{match.location}</CardDescription>
            </div>
          </div>
          {isTwoWay && (
            <Badge variant="secondary" className="ml-auto bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              Two-way Match
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-2">
        {match.matchedSkills.theyOffer.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-1">They can teach you:</p>
            <div className="flex flex-wrap gap-1">
              {match.matchedSkills.theyOffer.map((skill, index) => (
                <Badge key={index} variant="outline" className="hover:bg-muted transition-all duration-300">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {match.matchedSkills.youOffer.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-1">You can teach them:</p>
            <div className="flex flex-wrap gap-1">
              {match.matchedSkills.youOffer.map((skill, index) => (
                <Badge
                  key={index}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex gap-2 w-full">
          <Link href={`/profile/${match.id}`} className="w-1/2">
            <Button variant="outline" className="w-full hover:bg-muted transition-all duration-300">
              <User className="mr-2 h-4 w-4" />
              View Profile
            </Button>
          </Link>
          <Link href={`/messages/${match.id}`} className="w-1/2">
            <Button className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300">
              <MessageSquare className="mr-2 h-4 w-4" />
              Message
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}

function UserCard({
  user,
  delay = 0,
}: {
  user: { id: string; name: string; avatar: string; location: string; skillsOffered: string[]; skillsWanted: string[] }
  delay?: number
}) {
  return (
    <Card
      className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-up bg-card"
      style={{ animationDelay: `${delay}s` }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Avatar className="border-2 border-primary">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{user.name}</CardTitle>
            <CardDescription>{user.location}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-2">
        <div>
          <p className="text-sm font-medium mb-1">Skills Offered:</p>
          <div className="flex flex-wrap gap-1">
            {user.skillsOffered.map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 transition-all duration-300"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Skills Wanted:</p>
          <div className="flex flex-wrap gap-1">
            {user.skillsWanted.map((skill, index) => (
              <Badge key={index} variant="outline" className="hover:bg-muted transition-all duration-300">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex gap-2 w-full">
          <Link href={`/profile/${user.id}`} className="w-1/2">
            <Button variant="outline" className="w-full hover:bg-muted transition-all duration-300">
              <User className="mr-2 h-4 w-4" />
              View Profile
            </Button>
          </Link>
          <Link href={`/messages/${user.id}`} className="w-1/2">
            <Button className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300">
              <MessageSquare className="mr-2 h-4 w-4" />
              Message
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}

// Sample data for explore users
const exploreUsers = [
  {
    id: "5",
    name: "Alex Morgan",
    avatar: "/placeholder.svg?height=40&width=40",
    location: "Denver, CO",
    skillsOffered: ["Yoga", "Meditation", "Nutrition"],
    skillsWanted: ["Spanish", "French", "German"],
  },
  {
    id: "6",
    name: "Taylor Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    location: "Portland, OR",
    skillsOffered: ["Graphic Design", "Branding", "Typography"],
    skillsWanted: ["Photography", "Video Editing", "Animation"],
  },
]

