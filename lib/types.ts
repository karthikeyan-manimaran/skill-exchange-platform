export interface UserProfile {
  uid: string
  displayName: string
  email: string
  photoURL: string
  location: string
  bio: string
  skillsOffered: string[]
  skillsWanted: string[]
  createdAt: Date
}

export interface Match {
  id: string
  displayName: string
  photoURL: string
  location: string
  matchedSkills: {
    theyOffer: string[]
    youOffer: string[]
  }
}

export interface Conversation {
  id: string
  participants: string[]
  otherUser: {
    uid: string
    displayName: string
    photoURL: string
    location: string
  }
  lastMessage?: {
    senderId: string
    text: string
    timestamp: Date
  }
  updatedAt: Date
}

export interface Message {
  id: string
  senderId: string
  text: string
  timestamp: Date
}

export interface Booking {
  id: string
  hostId: string
  guestId: string
  host?: {
    uid: string
    displayName: string
    photoURL: string
  }
  guest?: {
    uid: string
    displayName: string
    photoURL: string
  }
  skill: string
  dateTime: Date
  duration: number // in minutes
  notes?: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  createdAt: Date
}

export interface Notification {
  id: string
  userId: string
  message: string
  read: boolean
  type: "new_match" | "new_message" | "booking_request" | "booking_accepted" | "booking_cancelled" | "booking_reminder"
  relatedId: string
  createdAt: Date
}

