"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { useAuth } from "@/lib/auth-context"
import { getUserProfile, updateUserProfile, getUserBookings } from "@/lib/firebase/firestore"
import type { UserProfile, Booking } from "@/lib/types"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Plus, X, Calendar, Star, Settings, Clock, User } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("about")
  const [newSkillOffered, setNewSkillOffered] = useState("")
  const [newSkillWanted, setNewSkillWanted] = useState("")
  const [message, setMessage] = useState({ type: "", text: "" })
  const [formData, setFormData] = useState({
    displayName: "",
    location: "",
    bio: "",
    skillsOffered: [] as string[],
    skillsWanted: [] as string[],
  })

  useEffect(() => {
    if (!user) return

    async function fetchData() {
      try {
        setIsLoading(true)

        // Fetch profile data
        const profileData = await getUserProfile(user.uid)
        if (profileData) {
          setProfile(profileData)
          setFormData({
            displayName: profileData.displayName || "",
            location: profileData.location || "",
            bio: profileData.bio || "",
            skillsOffered: profileData.skillsOffered || [],
            skillsWanted: profileData.skillsWanted || [],
          })
        }

        // Fetch bookings data
        const bookingsData = await getUserBookings(user.uid)
        setBookings(bookingsData)
      } catch (error) {
        console.error("Error fetching data:", error)
        setMessage({
          type: "error",
          text: "Failed to load profile data. Please try again later.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddSkillOffered = () => {
    if (newSkillOffered.trim() && !formData.skillsOffered.includes(newSkillOffered.trim())) {
      setFormData((prev) => ({
        ...prev,
        skillsOffered: [...prev.skillsOffered, newSkillOffered.trim()],
      }))
      setNewSkillOffered("")
    }
  }

  const handleAddSkillWanted = () => {
    if (newSkillWanted.trim() && !formData.skillsWanted.includes(newSkillWanted.trim())) {
      setFormData((prev) => ({
        ...prev,
        skillsWanted: [...prev.skillsWanted, newSkillWanted.trim()],
      }))
      setNewSkillWanted("")
    }
  }

  const handleRemoveSkillOffered = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skillsOffered: prev.skillsOffered.filter((s) => s !== skill),
    }))
  }

  const handleRemoveSkillWanted = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skillsWanted: prev.skillsWanted.filter((s) => s !== skill),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !profile) return

    setIsSaving(true)
    setMessage({ type: "", text: "" })

    try {
      await updateUserProfile(user.uid, {
        displayName: formData.displayName,
        location: formData.location,
        bio: formData.bio,
        skillsOffered: formData.skillsOffered,
        skillsWanted: formData.skillsWanted,
      })

      setProfile((prev) => {
        if (!prev) return null
        return {
          ...prev,
          displayName: formData.displayName,
          location: formData.location,
          bio: formData.bio,
          skillsOffered: formData.skillsOffered,
          skillsWanted: formData.skillsWanted,
        }
      })

      setMessage({
        type: "success",
        text: "Profile updated successfully!",
      })

      setIsEditing(false)

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ type: "", text: "" })
      }, 3000)
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage({
        type: "error",
        text: "Failed to update profile. Please try again later.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Get upcoming sessions (confirmed bookings with future dates)
  const upcomingSessions = bookings
    .filter((booking) => booking.status === "confirmed" && new Date(booking.dateTime) > new Date())
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())

  // Get the other user in a booking (host or guest)
  const getOtherUser = (booking: Booking) => {
    const isHost = user?.uid === booking.hostId
    return isHost ? booking.guest : booking.host
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {message.text && (
          <div
            className={`p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300" : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"}`}
          >
            {message.text}
          </div>
        )}

        {isEditing ? (
          <Card className="animate-fade-up">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Edit Profile
                </CardTitle>
                <CardDescription>Update your personal information and skills</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="displayName" className="text-sm font-medium">
                      Full Name
                    </label>
                    <Input
                      id="displayName"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium">
                      Location
                    </label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="City, Country"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="bio" className="text-sm font-medium">
                      Bio
                    </label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself..."
                      className="min-h-[120px]"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Skills You Can Teach</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.skillsOffered.map((skill, index) => (
                        <Badge
                          key={index}
                          className="bg-gradient-to-r from-primary to-accent text-primary-foreground group"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkillOffered(skill)}
                            className="ml-1 rounded-full hover:bg-primary-foreground/20 p-0.5 transition-colors"
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove</span>
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill you can teach"
                        value={newSkillOffered}
                        onChange={(e) => setNewSkillOffered(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddSkillOffered()
                          }
                        }}
                      />
                      <Button type="button" onClick={handleAddSkillOffered} size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Skills You Want to Learn</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.skillsWanted.map((skill, index) => (
                        <Badge key={index} variant="outline" className="group">
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkillWanted(skill)}
                            className="ml-1 rounded-full hover:bg-muted p-0.5 transition-colors"
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove</span>
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill you want to learn"
                        value={newSkillWanted}
                        onChange={(e) => setNewSkillWanted(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddSkillWanted()
                          }
                        }}
                      />
                      <Button type="button" onClick={handleAddSkillWanted} size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        ) : (
          <>
            <Card className="overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-primary to-accent"></div>
              <div className="relative px-6">
                <Avatar className="absolute -top-16 border-4 border-background h-32 w-32">
                  <AvatarImage
                    src={profile?.photoURL || "/placeholder.svg?height=128&width=128"}
                    alt={profile?.displayName || "User"}
                  />
                  <AvatarFallback className="text-4xl bg-gradient-to-r from-primary to-accent text-primary-foreground">
                    {profile?.displayName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>

              <CardHeader className="pt-20">
                <CardTitle className="text-2xl">{profile?.displayName}</CardTitle>
                {profile?.location && (
                  <CardDescription className="flex items-center gap-1">
                    <span className="inline-block h-3 w-3 rounded-full bg-primary/20 ring-2 ring-primary/20"></span>
                    {profile.location}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-foreground">{profile?.bio || "No bio provided yet."}</p>

                <div className="flex flex-wrap gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{profile?.skillsOffered?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Skills Offered</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{profile?.skillsWanted?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Skills Wanted</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{upcomingSessions.length}</div>
                    <div className="text-xs text-muted-foreground">Upcoming Sessions</div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => router.push("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <Button
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              </CardFooter>
            </Card>

            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-muted/50">
                <TabsTrigger
                  value="about"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground"
                >
                  About
                </TabsTrigger>
                <TabsTrigger
                  value="skills"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground"
                >
                  Skills
                </TabsTrigger>
                <TabsTrigger
                  value="sessions"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground"
                >
                  Sessions
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground"
                >
                  Reviews
                </TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About Me</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground">{profile?.bio || "No bio provided yet."}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground">{profile?.location || "No location provided yet."}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Member Since</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground">
                      {profile?.createdAt
                        ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Unknown"}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="skills" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Skills I Can Teach</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {profile?.skillsOffered && profile.skillsOffered.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.skillsOffered.map((skill, index) => (
                          <Badge
                            key={index}
                            className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No skills added yet.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Skills I Want to Learn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {profile?.skillsWanted && profile.skillsWanted.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.skillsWanted.map((skill, index) => (
                          <Badge key={index} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No skills added yet.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sessions" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upcomingSessions.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingSessions.map((session) => {
                          const otherUser = getOtherUser(session)
                          return (
                            <div
                              key={session.id}
                              className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex-shrink-0 flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Calendar className="h-8 w-8 text-primary" />
                                </div>
                              </div>
                              <div className="flex-grow space-y-2">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <h3 className="font-medium text-lg">{session.skill}</h3>
                                  <Badge className="w-fit">{format(new Date(session.dateTime), "EEEE, MMMM d")}</Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  <span>
                                    {format(new Date(session.dateTime), "h:mm a")} -
                                    {format(
                                      new Date(new Date(session.dateTime).getTime() + session.duration * 60000),
                                      "h:mm a",
                                    )}
                                    {` (${session.duration} minutes)`}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <div className="flex items-center gap-2">
                                    <span>With:</span>
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage
                                          src={otherUser?.photoURL || "/placeholder.svg?height=24&width=24"}
                                          alt={otherUser?.displayName || ""}
                                        />
                                        <AvatarFallback className="text-xs">
                                          {otherUser?.displayName?.charAt(0) || "?"}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="font-medium">{otherUser?.displayName}</span>
                                    </div>
                                  </div>
                                </div>
                                {session.notes && (
                                  <p className="text-sm text-muted-foreground border-t pt-2 mt-2">{session.notes}</p>
                                )}
                              </div>
                              <div className="flex-shrink-0 flex sm:flex-col gap-2 sm:gap-0 justify-end sm:justify-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => router.push(`/bookings?id=${session.id}`)}
                                >
                                  Details
                                </Button>
                                <Button
                                  size="sm"
                                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                                >
                                  Join
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-12 text-center">
                        <div>
                          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">No upcoming sessions</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            You don't have any scheduled sessions yet
                          </p>
                          <Button
                            onClick={() => router.push("/bookings")}
                            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                          >
                            Schedule a Session
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Reviews</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center py-12 text-center">
                    <div>
                      <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Complete sessions to receive reviews from other users
                      </p>
                      <Button
                        onClick={() => router.push("/explore")}
                        className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                      >
                        Find Learning Partners
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </AppLayout>
  )
}

