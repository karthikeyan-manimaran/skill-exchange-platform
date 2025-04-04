"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { getUserProfile, updateUserProfile } from "@/lib/firebase/firestore"
import type { UserProfile } from "@/lib/types"
import { AppLayout } from "@/components/app-layout"
import { User, Bell, Lock, Palette, Shield, ChevronLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("account")
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    location: "",
    bio: "",
    notifications: {
      email: true,
      push: true,
      messages: true,
      matches: true,
      bookings: true,
    },
    privacy: {
      profileVisibility: "public",
      showEmail: false,
      showLocation: true,
    },
    theme: "light",
    language: "en",
  })

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push("/login")
      return
    }

    async function fetchProfile() {
      try {
        const profileData = await getUserProfile(user.uid)
        if (profileData) {
          setProfile(profileData)
          setFormData({
            displayName: profileData.displayName || "",
            email: profileData.email || "",
            location: profileData.location || "",
            bio: profileData.bio || "",
            notifications: {
              email: true,
              push: true,
              messages: true,
              matches: true,
              bookings: true,
            },
            privacy: {
              profileVisibility: "public",
              showEmail: false,
              showLocation: true,
            },
            theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
            language: "en",
          })
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile. Please try again later.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [user, loading, router, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    if (name.startsWith("notifications.")) {
      const notificationKey = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [notificationKey]: checked,
        },
      }))
    } else if (name.startsWith("privacy.")) {
      const privacyKey = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        privacy: {
          ...prev.privacy,
          [privacyKey]: checked,
        },
      }))
    }
  }

  const handleRadioChange = (name: string, value: string) => {
    if (name === "privacy.profileVisibility") {
      setFormData((prev) => ({
        ...prev,
        privacy: {
          ...prev.privacy,
          profileVisibility: value,
        },
      }))
    } else if (name === "theme") {
      setFormData((prev) => ({
        ...prev,
        theme: value,
      }))

      // Apply theme change
      if (value === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    } else if (name === "language") {
      setFormData((prev) => ({
        ...prev,
        language: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !profile) return

    setIsSaving(true)

    try {
      // Only update the fields that are relevant to the current tab
      let updateData: Partial<UserProfile> = {}

      if (activeTab === "account") {
        updateData = {
          displayName: formData.displayName,
          location: formData.location,
          bio: formData.bio,
        }
      }

      await updateUserProfile(user.uid, updateData)

      toast({
        title: "Success",
        description: "Settings saved successfully!",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings. Please try again later.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AppLayout showSearch={false}>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout showSearch={false}>
      <div className="container py-6 max-w-6xl mx-auto">
        <div className="flex flex-col space-y-4 mb-8">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="space-y-1">
              <Button
                variant={activeTab === "account" ? "default" : "ghost"}
                className={`w-full justify-start ${activeTab === "account" ? "bg-gradient-to-r from-primary to-accent text-primary-foreground" : ""}`}
                onClick={() => setActiveTab("account")}
              >
                <User className="mr-2 h-4 w-4" />
                Account
              </Button>
              <Button
                variant={activeTab === "notifications" ? "default" : "ghost"}
                className={`w-full justify-start ${activeTab === "notifications" ? "bg-gradient-to-r from-primary to-accent text-primary-foreground" : ""}`}
                onClick={() => setActiveTab("notifications")}
              >
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </Button>
              <Button
                variant={activeTab === "privacy" ? "default" : "ghost"}
                className={`w-full justify-start ${activeTab === "privacy" ? "bg-gradient-to-r from-primary to-accent text-primary-foreground" : ""}`}
                onClick={() => setActiveTab("privacy")}
              >
                <Lock className="mr-2 h-4 w-4" />
                Privacy
              </Button>
              <Button
                variant={activeTab === "appearance" ? "default" : "ghost"}
                className={`w-full justify-start ${activeTab === "appearance" ? "bg-gradient-to-r from-primary to-accent text-primary-foreground" : ""}`}
                onClick={() => setActiveTab("appearance")}
              >
                <Palette className="mr-2 h-4 w-4" />
                Appearance
              </Button>
              <Button
                variant={activeTab === "security" ? "default" : "ghost"}
                className={`w-full justify-start ${activeTab === "security" ? "bg-gradient-to-r from-primary to-accent text-primary-foreground" : ""}`}
                onClick={() => setActiveTab("security")}
              >
                <Shield className="mr-2 h-4 w-4" />
                Security
              </Button>
            </div>
            <Separator className="my-6" />
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/dashboard">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          <div className="md:col-span-3">
            <div className="bg-card rounded-lg border shadow-sm p-6">
              <form onSubmit={handleSubmit}>
                {activeTab === "account" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Account Information</h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Full Name</Label>
                        <Input
                          id="displayName"
                          name="displayName"
                          value={formData.displayName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" name="email" value={formData.email} onChange={handleInputChange} disabled />
                        <p className="text-sm text-muted-foreground">
                          Email cannot be changed. Contact support for assistance.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="City, Country"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
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
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Notification Preferences</h2>
                    <div className="space-y-4">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="notifications.email"
                            checked={formData.notifications.email}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange("notifications.email", checked as boolean)
                            }
                          />
                          <Label htmlFor="notifications.email" className="font-medium">
                            Email Notifications
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground pl-6">Receive notifications via email</p>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="notifications.push"
                            checked={formData.notifications.push}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange("notifications.push", checked as boolean)
                            }
                          />
                          <Label htmlFor="notifications.push" className="font-medium">
                            Push Notifications
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground pl-6">Receive notifications on your device</p>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="notifications.messages"
                            checked={formData.notifications.messages}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange("notifications.messages", checked as boolean)
                            }
                          />
                          <Label htmlFor="notifications.messages" className="font-medium">
                            Message Notifications
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground pl-6">Get notified when you receive new messages</p>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="notifications.matches"
                            checked={formData.notifications.matches}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange("notifications.matches", checked as boolean)
                            }
                          />
                          <Label htmlFor="notifications.matches" className="font-medium">
                            Match Notifications
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground pl-6">
                          Get notified when you have new skill matches
                        </p>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="notifications.bookings"
                            checked={formData.notifications.bookings}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange("notifications.bookings", checked as boolean)
                            }
                          />
                          <Label htmlFor="notifications.bookings" className="font-medium">
                            Booking Notifications
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground pl-6">
                          Get notified about booking requests and confirmations
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "privacy" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Privacy Settings</h2>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-base">Profile Visibility</Label>
                        <RadioGroup
                          value={formData.privacy.profileVisibility}
                          onValueChange={(value) => handleRadioChange("privacy.profileVisibility", value)}
                          className="space-y-4"
                        >
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="public" id="privacy.profileVisibility.public" />
                              <Label htmlFor="privacy.profileVisibility.public" className="font-medium">
                                Public
                              </Label>
                            </div>
                            <p className="text-sm text-muted-foreground pl-6">Anyone can view your profile</p>
                          </div>

                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="matches" id="privacy.profileVisibility.matches" />
                              <Label htmlFor="privacy.profileVisibility.matches" className="font-medium">
                                Matches Only
                              </Label>
                            </div>
                            <p className="text-sm text-muted-foreground pl-6">
                              Only users you've matched with can view your profile
                            </p>
                          </div>

                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="private" id="privacy.profileVisibility.private" />
                              <Label htmlFor="privacy.profileVisibility.private" className="font-medium">
                                Private
                              </Label>
                            </div>
                            <p className="text-sm text-muted-foreground pl-6">
                              Your profile is hidden from other users
                            </p>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="privacy.showEmail"
                            checked={formData.privacy.showEmail}
                            onCheckedChange={(checked) => handleCheckboxChange("privacy.showEmail", checked as boolean)}
                          />
                          <Label htmlFor="privacy.showEmail" className="font-medium">
                            Show Email Address
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground pl-6">
                          Allow other users to see your email address
                        </p>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="privacy.showLocation"
                            checked={formData.privacy.showLocation}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange("privacy.showLocation", checked as boolean)
                            }
                          />
                          <Label htmlFor="privacy.showLocation" className="font-medium">
                            Show Location
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground pl-6">Allow other users to see your location</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "appearance" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Appearance Settings</h2>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-base">Theme</Label>
                        <RadioGroup
                          value={formData.theme}
                          onValueChange={(value) => handleRadioChange("theme", value)}
                          className="space-y-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="light" id="theme.light" />
                            <Label htmlFor="theme.light">Light</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="dark" id="theme.dark" />
                            <Label htmlFor="theme.dark">Dark</Label>
                          </div>

                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="system" id="theme.system" />
                              <Label htmlFor="theme.system">System</Label>
                            </div>
                            <p className="text-sm text-muted-foreground pl-6">Follow your system's theme settings</p>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-base">Language</Label>
                        <RadioGroup
                          value={formData.language}
                          onValueChange={(value) => handleRadioChange("language", value)}
                          className="space-y-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="en" id="language.en" />
                            <Label htmlFor="language.en">English</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="es" id="language.es" />
                            <Label htmlFor="language.es">Español</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fr" id="language.fr" />
                            <Label htmlFor="language.fr">Français</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "security" && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Security Settings</h2>
                    <div className="space-y-6">
                      <div className="flex flex-col space-y-2 p-4 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Password</h3>
                          <Button variant="outline" size="sm">
                            Change Password
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">Last changed: Never</p>
                      </div>

                      <div className="flex flex-col space-y-2 p-4 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Two-Factor Authentication</h3>
                          <Button variant="outline" size="sm">
                            Enable
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                      </div>

                      <div className="flex flex-col space-y-2 p-4 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Active Sessions</h3>
                          <Button variant="outline" size="sm">
                            Manage
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">View and manage your active sessions</p>
                      </div>

                      <div className="flex flex-col space-y-2 p-4 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Account Deletion</h3>
                          <Button variant="destructive" size="sm">
                            Delete Account
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account and all your data
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-4 mt-8">
                  <Button variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  >
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

