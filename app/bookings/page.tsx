"use client"

import type React from "react"

import { useEffect, useState, type KeyboardEvent } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, Clock, Plus } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { getUserBookings, createBooking, updateBooking } from "@/lib/firebase/firestore"
import type { Booking, UserProfile } from "@/lib/types"
import { AppLayout } from "@/components/app-layout"
import { Input } from "@/components/ui/input"

export default function BookingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [date, setDate] = useState<Date>(new Date())
  const [time, setTime] = useState<string>("10:00")
  const [duration, setDuration] = useState<string>("60")
  const [notes, setNotes] = useState<string>("")
  const [userName, setUserName] = useState<string>("")
  const [selectedSkill, setSelectedSkill] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreatingBooking, setIsCreatingBooking] = useState(false)
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [availableSkills, setAvailableSkills] = useState<string[]>([
    "JavaScript",
    "React",
    "Node.js",
    "Python",
    "UI Design",
    "Graphic Design",
    "Photography",
    "Spanish",
    "French",
    "Cooking",
  ])

  useEffect(() => {
    if (loading) return

    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please login to access bookings.",
      })
      router.push("/login")
      return
    }

    async function fetchData() {
      try {
        console.log("Fetching bookings for user:", user.uid)
        const bookingsData = await getUserBookings(user.uid)
        console.log("Bookings data received:", bookingsData)
        setBookings(bookingsData)
      } catch (error) {
        console.error("Error fetching bookings:", error)
        toast({
          variant: "destructive",
          title: "Error loading bookings",
          description: "Failed to load your bookings. Please try again later.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, loading, router, toast])

  const validateForm = () => {
    const errors: { [key: string]: string } = {}

    if (!user) {
      errors.user = "User authentication required"
    }

    if (!userName.trim()) {
      errors.userName = "Please enter a user name"
    }

    if (!selectedSkill) {
      errors.selectedSkill = "Please select a skill"
    }

    if (!date) {
      errors.date = "Please select a date"
    }

    if (!time) {
      errors.time = "Please select a time"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateBooking = async () => {
    // Validate form
    if (!validateForm()) {
      const errorFields = Object.keys(formErrors).join(", ")
      toast({
        variant: "destructive",
        title: "Missing information",
        description: `Please fill in all required fields: ${errorFields}`,
      })
      return
    }

    // Prevent multiple submissions
    if (isCreatingBooking) {
      return
    }

    setIsCreatingBooking(true)

    try {
      // Combine date and time
      const [hours, minutes] = time.split(":").map(Number)
      const bookingDateTime = new Date(date)
      bookingDateTime.setHours(hours, minutes)

      // Create a mock user profile based on the entered name
      const guestUser: UserProfile = {
        uid: `guest-${Date.now()}`, // Generate a temporary ID
        displayName: userName,
        photoURL: "/placeholder.svg?height=40&width=40",
        location: "Unknown Location",
        skillsOffered: [selectedSkill],
        skillsWanted: [],
      }

      console.log("Creating booking with data:", {
        hostId: user?.uid,
        guestId: guestUser.uid,
        skill: selectedSkill,
        dateTime: bookingDateTime,
        duration: Number.parseInt(duration),
        notes: notes,
        status: "confirmed", // Set as confirmed directly
      })

      // Create the booking data object
      const bookingData = {
        hostId: user?.uid || "",
        guestId: guestUser.uid,
        skill: selectedSkill,
        dateTime: bookingDateTime,
        duration: Number.parseInt(duration),
        notes: notes,
        status: "confirmed", // Set as confirmed directly
        createdAt: new Date(),
      }

      // Call the createBooking function
      const newBooking = await createBooking(bookingData)

      console.log("Booking created successfully:", newBooking)

      // Create a complete booking object with all required fields
      const completeBooking = {
        id: newBooking.id,
        ...bookingData,
        // Add host and guest objects to match the expected Booking type
        host: {
          uid: user?.uid || "",
          displayName: user?.displayName || "Current User",
          photoURL: user?.photoURL || "/placeholder.svg?height=40&width=40",
        },
        guest: guestUser,
      } as Booking

      // Add the new booking to the state immediately
      setBookings((prevBookings) => [...prevBookings, completeBooking])
      console.log("Updated bookings state with new booking:", completeBooking)

      toast({
        title: "Booking created!",
        description: `You've scheduled a session with ${userName}.`,
      })

      // Reset form
      setOpenDialog(false)
      setDate(new Date())
      setTime("10:00")
      setDuration("60")
      setNotes("")
      setUserName("")
      setSelectedSkill("")
      setFormErrors({})
    } catch (error) {
      console.error("Error creating booking:", error)
      toast({
        variant: "destructive",
        title: "Failed to create booking",
        description: "Please try again later.",
      })
    } finally {
      setIsCreatingBooking(false)
    }
  }

  const handleSkillSelect = (skill: string) => {
    setSelectedSkill(skill)
    setFormErrors((prev) => ({ ...prev, selectedSkill: "" }))
  }

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate)
      setFormErrors((prev) => ({ ...prev, date: "" }))
    }
  }

  const handleTimeSelect = (newTime: string) => {
    setTime(newTime)
    setFormErrors((prev) => ({ ...prev, time: "" }))
  }

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value)
    setFormErrors((prev) => ({ ...prev, userName: "" }))
  }

  const handleUserNameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (userName.trim()) {
        // Focus on the next field (skill selection)
        const skillElement = document.getElementById("skill-select")
        if (skillElement) {
          skillElement.focus()
        }
      }
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // Implement booking search functionality here
  }

  const handleRescheduleBooking = async (bookingId: string, updatedData: Partial<Booking>) => {
    try {
      console.log("Rescheduling booking:", bookingId, "with data:", updatedData)

      // Update the booking in the database
      await updateBooking(bookingId, updatedData)

      // Update the booking in the local state
      setBookings((prevBookings) =>
        prevBookings.map((booking) => {
          if (booking.id === bookingId) {
            // Create a new booking object with the updated data
            const updatedBooking = { ...booking, ...updatedData }
            console.log("Updated booking in state:", updatedBooking)
            return updatedBooking
          }
          return booking
        }),
      )

      toast({
        title: "Booking rescheduled",
        description: "Your session has been successfully rescheduled.",
      })

      return true
    } catch (error) {
      console.error("Error rescheduling booking:", error)
      toast({
        variant: "destructive",
        title: "Failed to reschedule",
        description: "There was an error rescheduling your session. Please try again.",
      })

      return false
    }
  }

  if (isLoading) {
    return (
      <AppLayout showSearch={true} searchPlaceholder="Search bookings...">
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your bookings...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout showSearch={true} searchPlaceholder="Search bookings..." onSearch={handleSearch}>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Bookings
          </h1>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Schedule a Skill Exchange Session</DialogTitle>
                <DialogDescription>Book a time to learn from or teach another user.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">User Name</label>
                  <Input
                    placeholder="Enter user name"
                    value={userName}
                    onChange={handleUserNameChange}
                    onKeyDown={handleUserNameKeyDown}
                    className={formErrors.userName ? "border-red-500" : ""}
                  />
                  {formErrors.userName && <p className="text-xs text-red-500">{formErrors.userName}</p>}
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Select Skill</label>
                  <Select id="skill-select" value={selectedSkill} onValueChange={handleSkillSelect}>
                    <SelectTrigger className={formErrors.selectedSkill ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select a skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSkills.map((skill) => (
                        <SelectItem key={skill} value={skill}>
                          {skill}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.selectedSkill && <p className="text-xs text-red-500">{formErrors.selectedSkill}</p>}
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          formErrors.date ? "border-red-500" : !date && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  {formErrors.date && <p className="text-xs text-red-500">{formErrors.date}</p>}
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Time</label>
                  <Select value={time} onValueChange={handleTimeSelect}>
                    <SelectTrigger className={formErrors.time ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }).map((_, hour) =>
                        [0, 30].map((minute) => {
                          const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
                          return (
                            <SelectItem key={timeString} value={timeString}>
                              {timeString}
                            </SelectItem>
                          )
                        }),
                      )}
                    </SelectContent>
                  </Select>
                  {formErrors.time && <p className="text-xs text-red-500">{formErrors.time}</p>}
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                      <SelectItem value="120">120 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    placeholder="Add any additional information..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBooking} disabled={isCreatingBooking}>
                  {isCreatingBooking ? "Creating..." : "Create Booking"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            {bookings.filter((b) => b.status === "confirmed" && new Date(b.dateTime) > new Date()).length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {bookings
                  .filter((b) => b.status === "confirmed" && new Date(b.dateTime) > new Date())
                  .map((booking) => (
                    <BookingCard key={booking.id} booking={booking} onReschedule={handleRescheduleBooking} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No upcoming bookings</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            {bookings.filter((b) => b.status === "pending").length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {bookings
                  .filter((b) => b.status === "pending")
                  .map((booking) => (
                    <BookingCard key={booking.id} booking={booking} onReschedule={handleRescheduleBooking} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No pending bookings</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {bookings.filter((b) => b.status === "confirmed" && new Date(b.dateTime) <= new Date()).length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {bookings
                  .filter((b) => b.status === "confirmed" && new Date(b.dateTime) <= new Date())
                  .map((booking) => (
                    <BookingCard key={booking.id} booking={booking} onReschedule={handleRescheduleBooking} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No past bookings</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}

function BookingCard({
  booking,
  onReschedule,
}: {
  booking: Booking
  onReschedule: (bookingId: string, updatedData: Partial<Booking>) => Promise<boolean>
}) {
  const { user } = useAuth()
  const { toast } = useToast()
  const isHost = user?.uid === booking.hostId
  const otherUser = isHost ? booking.guest : booking.host

  // State for reschedule dialog
  const [openRescheduleDialog, setOpenRescheduleDialog] = useState(false)
  const [rescheduleDate, setRescheduleDate] = useState<Date>(new Date(booking.dateTime))
  const [rescheduleTime, setRescheduleTime] = useState<string>(format(new Date(booking.dateTime), "HH:mm"))
  const [rescheduleDuration, setRescheduleDuration] = useState<string>(booking.duration.toString())
  const [rescheduleNotes, setRescheduleNotes] = useState<string>(booking.notes || "")
  const [isRescheduling, setIsRescheduling] = useState(false)

  const handleRescheduleSubmit = async () => {
    if (!rescheduleDate || !rescheduleTime) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select both date and time for rescheduling.",
      })
      return
    }

    setIsRescheduling(true)

    try {
      // Combine date and time
      const [hours, minutes] = rescheduleTime.split(":").map(Number)
      const bookingDateTime = new Date(rescheduleDate)
      bookingDateTime.setHours(hours, minutes)

      // Prepare updated booking data
      const updatedData: Partial<Booking> = {
        dateTime: bookingDateTime,
        duration: Number.parseInt(rescheduleDuration),
        notes: rescheduleNotes,
      }

      // Call the parent component's reschedule function
      const success = await onReschedule(booking.id, updatedData)

      if (success) {
        setOpenRescheduleDialog(false)
      }
    } catch (error) {
      console.error("Error in reschedule submit:", error)
      toast({
        variant: "destructive",
        title: "Reschedule failed",
        description: "There was an error rescheduling your session. Please try again.",
      })
    } finally {
      setIsRescheduling(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage
                src={otherUser?.photoURL || "/placeholder.svg?height=40&width=40"}
                alt={otherUser?.displayName || ""}
              />
              <AvatarFallback>{otherUser?.displayName?.charAt(0) || "?"}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{otherUser?.displayName}</CardTitle>
              <CardDescription>{booking.skill}</CardDescription>
            </div>
          </div>
          <Badge
            variant={
              booking.status === "confirmed" ? "default" : booking.status === "pending" ? "outline" : "secondary"
            }
          >
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-2">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span>{format(new Date(booking.dateTime), "PPP")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>
            {format(new Date(booking.dateTime), "p")} -
            {format(new Date(new Date(booking.dateTime).getTime() + booking.duration * 60000), "p")}
            {` (${booking.duration} minutes)`}
          </span>
        </div>
        {booking.notes && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">{booking.notes}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex gap-2 w-full">
          {booking.status === "pending" && !isHost && (
            <>
              <Button variant="outline" className="w-1/2">
                Decline
              </Button>
              <Button className="w-1/2">Accept</Button>
            </>
          )}
          {booking.status === "pending" && isHost && (
            <Button variant="outline" className="w-full">
              Cancel Request
            </Button>
          )}
          {booking.status === "confirmed" && (
            <>
              <Dialog open={openRescheduleDialog} onOpenChange={setOpenRescheduleDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-1/2">
                    Reschedule
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Reschedule Session</DialogTitle>
                    <DialogDescription>
                      Update the date and time for your session with {otherUser?.displayName}.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {rescheduleDate ? format(rescheduleDate, "PPP") : "Select a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={rescheduleDate}
                            onSelect={(date) => date && setRescheduleDate(date)}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Time</label>
                      <Select value={rescheduleTime} onValueChange={setRescheduleTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a time" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }).map((_, hour) =>
                            [0, 30].map((minute) => {
                              const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
                              return (
                                <SelectItem key={timeString} value={timeString}>
                                  {timeString}
                                </SelectItem>
                              )
                            }),
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Duration (minutes)</label>
                      <Select value={rescheduleDuration} onValueChange={setRescheduleDuration}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                          <SelectItem value="90">90 minutes</SelectItem>
                          <SelectItem value="120">120 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Notes</label>
                      <Textarea
                        placeholder="Add any additional information..."
                        value={rescheduleNotes}
                        onChange={(e) => setRescheduleNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpenRescheduleDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleRescheduleSubmit} disabled={isRescheduling}>
                      {isRescheduling ? "Updating..." : "Update Booking"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button className="w-1/2">Join Session</Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

