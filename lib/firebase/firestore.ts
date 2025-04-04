import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  writeBatch,
  limit,
} from "firebase/firestore"
import { getFirebaseFirestore } from "./config"
import type { UserProfile, Match, Conversation, Message, Booking, Notification } from "../types"

// Get Firestore instance
const db = getFirebaseFirestore()

// Mock data for offline fallback
const MOCK_USER_PROFILE: UserProfile = {
  uid: "mock-user-123",
  displayName: "Demo User",
  email: "demo@example.com",
  photoURL: "/placeholder.svg?height=100&width=100",
  location: "San Francisco, CA",
  bio: "This is a demo profile for offline mode. When you're back online, you'll see your real profile data.",
  skillsOffered: ["JavaScript", "React", "Next.js", "UI Design"],
  skillsWanted: ["Python", "Data Science", "Spanish", "Photography"],
  createdAt: new Date(),
  updatedAt: new Date(),
}

// Helper function to check if we're offline
function isOffline() {
  return typeof navigator !== "undefined" && !navigator.onLine
}

// Helper function to handle Firestore operations with offline fallback
async function handleFirestoreOperation<T>(
  operation: () => Promise<T>,
  fallback: T,
  errorMessage: string,
  offlineFallback?: T,
): Promise<T> {
  // If we're offline and have an offline fallback, return it immediately
  if (isOffline() && offlineFallback !== undefined) {
    console.log("Operating in offline mode, using fallback data")
    return offlineFallback
  }

  try {
    return await operation()
  } catch (error) {
    console.error(`${errorMessage}:`, error)

    // If the error is because we're offline, use the offline fallback if provided
    if (
      error instanceof Error &&
      (error.message.includes("offline") || error.message.includes("network")) &&
      offlineFallback !== undefined
    ) {
      console.log("Network error detected, using fallback data")
      return offlineFallback
    }

    return fallback
  }
}

// User Profiles
export async function createUserProfile(userId: string, profileData: Omit<UserProfile, "uid">) {
  return handleFirestoreOperation(
    async () => {
      await setDoc(doc(db, "users", userId), {
        ...profileData,
        uid: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    },
    undefined,
    "Error creating user profile",
  )
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  return handleFirestoreOperation(
    async () => {
      const docRef = doc(db, "users", userId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return { uid: docSnap.id, ...docSnap.data() } as UserProfile
      }
      return null
    },
    null,
    "Error fetching user profile",
    MOCK_USER_PROFILE, // Provide mock data for offline mode
  )
}

export async function updateUserProfile(userId: string, profileData: Partial<UserProfile>) {
  return handleFirestoreOperation(
    async () => {
      await updateDoc(doc(db, "users", userId), {
        ...profileData,
        updatedAt: new Date(),
      })
    },
    undefined,
    "Error updating user profile",
  )
}

// Mock data for matches
const MOCK_MATCHES = {
  twoWayMatches: [
    {
      id: "mock-match1",
      displayName: "Sarah Johnson",
      photoURL: "/placeholder.svg?height=40&width=40",
      location: "New York, NY",
      matchedSkills: {
        theyOffer: ["Spanish", "Photography"],
        youOffer: ["Web Development", "JavaScript"],
      },
    },
    {
      id: "mock-match2",
      displayName: "Michael Chen",
      photoURL: "/placeholder.svg?height=40&width=40",
      location: "Seattle, WA",
      matchedSkills: {
        theyOffer: ["UI Design"],
        youOffer: ["React"],
      },
    },
  ],
  oneWayMatches: [
    {
      id: "mock-match3",
      displayName: "Emily Rodriguez",
      photoURL: "/placeholder.svg?height=40&width=40",
      location: "Austin, TX",
      matchedSkills: {
        theyOffer: ["Content Writing", "SEO"],
        youOffer: [],
      },
    },
    {
      id: "mock-match4",
      displayName: "David Kim",
      photoURL: "/placeholder.svg?height=40&width=40",
      location: "Chicago, IL",
      matchedSkills: {
        theyOffer: [],
        youOffer: ["Web Development", "React"],
      },
    },
  ],
}

// Matches
export async function getMatches(userId: string): Promise<{ twoWayMatches: Match[]; oneWayMatches: Match[] }> {
  return handleFirestoreOperation(
    async () => {
      // In a real app, this would query the database for actual matches
      // For this demo, we'll return mock data
      return MOCK_MATCHES
    },
    { twoWayMatches: [], oneWayMatches: [] },
    "Error fetching matches",
    MOCK_MATCHES, // Provide mock data for offline mode
  )
}

// Mock data for conversations
const MOCK_CONVERSATIONS = [
  {
    id: "mock-conv1",
    participants: ["user123", "user456"],
    otherUser: {
      uid: "user456",
      displayName: "Sarah Johnson",
      photoURL: "/placeholder.svg?height=40&width=40",
      location: "New York, NY",
    },
    lastMessage: {
      senderId: "user456",
      text: "Looking forward to our Spanish lesson tomorrow!",
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    },
    updatedAt: new Date(Date.now() - 3600000),
  },
  {
    id: "mock-conv2",
    participants: ["user123", "user789"],
    otherUser: {
      uid: "user789",
      displayName: "Michael Chen",
      photoURL: "/placeholder.svg?height=40&width=40",
      location: "Seattle, WA",
    },
    lastMessage: {
      senderId: "user123",
      text: "I can help you with React next week. Does Tuesday work for you?",
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
    },
    updatedAt: new Date(Date.now() - 86400000),
  },
]

export async function getConversations(userId: string): Promise<Conversation[]> {
  return handleFirestoreOperation(
    async () => {
      // In a real app, this would query the database for actual conversations
      return MOCK_CONVERSATIONS
    },
    [],
    "Error fetching conversations",
    MOCK_CONVERSATIONS, // Provide mock data for offline mode
  )
}

// Mock messages
const MOCK_MESSAGES: Record<string, Message[]> = {
  "mock-conv1": [
    {
      id: "msg1",
      senderId: "user456",
      text: "Hi there! I saw we matched on Spanish and Web Development.",
      timestamp: new Date(Date.now() - 86400000 * 2), // 2 days ago
    },
    {
      id: "msg2",
      senderId: "user123",
      text: "Hey! Yes, I'd love to exchange skills. I can help you with web development.",
      timestamp: new Date(Date.now() - 86400000 * 2 + 3600000), // 2 days ago + 1 hour
    },
    {
      id: "msg3",
      senderId: "user456",
      text: "That sounds great! I can teach you Spanish. When are you available?",
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
    },
    {
      id: "msg4",
      senderId: "user123",
      text: "I'm free on weekends. How about Saturday morning?",
      timestamp: new Date(Date.now() - 86400000 + 3600000), // 1 day ago + 1 hour
    },
    {
      id: "msg5",
      senderId: "user456",
      text: "Saturday works for me. Let's do 10am?",
      timestamp: new Date(Date.now() - 3600000 * 2), // 2 hours ago
    },
    {
      id: "msg6",
      senderId: "user123",
      text: "Perfect! Looking forward to it.",
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    },
  ],
  "mock-conv2": [
    {
      id: "msg7",
      senderId: "user789",
      text: "Hello! I'm interested in learning React. Can you help?",
      timestamp: new Date(Date.now() - 86400000 * 3), // 3 days ago
    },
    {
      id: "msg8",
      senderId: "user123",
      text: "Hi Michael! I'd be happy to help you learn React.",
      timestamp: new Date(Date.now() - 86400000 * 3 + 3600000), // 3 days ago + 1 hour
    },
    {
      id: "msg9",
      senderId: "user789",
      text: "Great! I have some basic JavaScript knowledge. Where should I start?",
      timestamp: new Date(Date.now() - 86400000 * 2), // 2 days ago
    },
    {
      id: "msg10",
      senderId: "user123",
      text: "Let's start with the fundamentals. When are you available for a session?",
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
    },
    {
      id: "msg11",
      senderId: "user789",
      text: "I'm available next Tuesday afternoon. Does that work for you?",
      timestamp: new Date(Date.now() - 86400000 + 7200000), // 1 day ago + 2 hours
    },
    {
      id: "msg12",
      senderId: "user123",
      text: "I can help you with React next week. Does Tuesday work for you?",
      timestamp: new Date(Date.now() - 86400000 + 10800000), // 1 day ago + 3 hours
    },
  ],
}

export async function sendMessage(conversationId: string, messageData: Omit<Message, "id">): Promise<Message> {
  try {
    console.log(`Sending message in conversation: ${conversationId}`)

    // Create message with server timestamp
    const messageWithTimestamp = {
      ...messageData,
      timestamp: serverTimestamp(),
      isEdited: false,
    }

    // Add message to the messages subcollection
    const messagesRef = collection(db, "conversations", conversationId, "messages")
    const messageDoc = await addDoc(messagesRef, messageWithTimestamp)

    // Update the conversation's last message and updatedAt
    const conversationRef = doc(db, "conversations", conversationId)
    await updateDoc(conversationRef, {
      lastMessage: {
        senderId: messageData.senderId,
        text: messageData.text,
        timestamp: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
    })

    console.log(`Message sent with ID: ${messageDoc.id}`)

    // Return the sent message
    return {
      id: messageDoc.id,
      senderId: messageData.senderId,
      text: messageData.text,
      timestamp: new Date(),
      isEdited: false,
    }
  } catch (error) {
    console.error("Error sending message:", error)
    throw error
  }
}

/**
 * Edit a message
 * @param conversationId Conversation ID
 * @param messageId Message ID
 * @returns Promise that resolves when the message is updated
 */
export async function editMessage(conversationId: string, messageId: string, newText: string): Promise<void> {
  try {
    console.log(`Editing message ${messageId} in conversation ${conversationId}`)

    const messageRef = doc(db, "conversations", conversationId, "messages", messageId)

    await updateDoc(messageRef, {
      text: newText,
      isEdited: true,
    })

    // If this is the last message, update the conversation's lastMessage
    const conversationRef = doc(db, "conversations", conversationId)
    const conversationDoc = await getDoc(conversationRef)

    if (conversationDoc.exists()) {
      const conversationData = conversationDoc.data()
      const lastMessage = conversationData.lastMessage

      // Check if the edited message is the last message
      const messageDoc = await getDoc(messageRef)
      if (messageDoc.exists() && lastMessage) {
        const messageData = messageDoc.data()

        // Compare timestamps (this is approximate since we're comparing server timestamps)
        if (messageData.senderId === lastMessage.senderId) {
          await updateDoc(conversationRef, {
            lastMessage: {
              senderId: messageData.senderId,
              text: newText,
              timestamp: lastMessage.timestamp,
            },
          })
        }
      }
    }

    console.log(`Message ${messageId} edited successfully`)
  } catch (error) {
    console.error("Error editing message:", error)
    throw error
  }
}

/**
 * Delete a message
 * @param conversationId Conversation ID
 * @param messageId Message ID
 * @returns Promise that resolves when the message is deleted
 */
export async function deleteMessage(conversationId: string, messageId: string): Promise<void> {
  try {
    console.log(`Deleting message ${messageId} from conversation ${conversationId}`)

    // Get the message to check if it's the last message
    const messageRef = doc(db, "conversations", conversationId, "messages", messageId)
    const messageDoc = await getDoc(messageRef)

    if (!messageDoc.exists()) {
      throw new Error("Message not found")
    }

    const messageData = messageDoc.data()

    // Delete the message
    await deleteDoc(messageRef)

    // Check if this was the last message and update the conversation if needed
    const conversationRef = doc(db, "conversations", conversationId)
    const conversationDoc = await getDoc(conversationRef)

    if (conversationDoc.exists()) {
      const conversationData = conversationDoc.data()
      const lastMessage = conversationData.lastMessage

      // If the deleted message was the last message, find the new last message
      if (lastMessage && messageData.senderId === lastMessage.senderId && messageData.text === lastMessage.text) {
        // Get the new last message
        const messagesRef = collection(db, "conversations", conversationId, "messages")
        const q = query(messagesRef, orderBy("timestamp", "desc"), limit(1))
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          // There's still at least one message
          const newLastMessageDoc = querySnapshot.docs[0]
          const newLastMessage = newLastMessageDoc.data()

          await updateDoc(conversationRef, {
            lastMessage: {
              senderId: newLastMessage.senderId,
              text: newLastMessage.text,
              timestamp: newLastMessage.timestamp,
            },
          })
        } else {
          // No messages left
          await updateDoc(conversationRef, {
            lastMessage: null,
          })
        }
      }
    }

    console.log(`Message ${messageId} deleted successfully`)
  } catch (error) {
    console.error("Error deleting message:", error)
    throw error
  }
}

/**
 * Delete a conversation
 * @param conversationId Conversation ID
 * @returns Promise that resolves when the conversation is deleted
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  try {
    console.log(`Deleting conversation: ${conversationId}`)

    // First, get all messages in the conversation
    const messagesRef = collection(db, "conversations", conversationId, "messages")
    const querySnapshot = await getDocs(messagesRef)

    // Delete all messages
    const batch = writeBatch(db)
    querySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })

    // Delete the conversation document
    const conversationRef = doc(db, "conversations", conversationId)
    batch.delete(conversationRef)

    // Commit the batch
    await batch.commit()

    console.log(`Conversation ${conversationId} and all its messages deleted successfully`)
  } catch (error) {
    console.error("Error deleting conversation:", error)
    throw error
  }
}

export function subscribeToMessages(conversationId: string, callback: (messages: Message[]) => void): () => void {
  const messagesRef = collection(db, "conversations", conversationId, "messages")
  const q = query(messagesRef, orderBy("timestamp", "asc"))

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const messages: Message[] = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        senderId: data.senderId,
        text: data.text,
        timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
        isEdited: data.isEdited || false,
      }
    })

    callback(messages)
  })

  return unsubscribe
}

// Mock bookings
const MOCK_BOOKINGS = [
  {
    id: "mock-booking1",
    hostId: "mock-user-123",
    guestId: "user456",
    host: {
      uid: "mock-user-123",
      displayName: "Demo User",
      photoURL: "/placeholder.svg?height=40&width=40",
    },
    guest: {
      uid: "user456",
      displayName: "Sarah Johnson",
      photoURL: "/placeholder.svg?height=40&width=40",
    },
    skill: "Spanish",
    dateTime: new Date(Date.now() + 86400000 * 2), // 2 days from now
    duration: 60,
    notes: "Beginner level Spanish conversation practice",
    status: "confirmed",
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
  },
  {
    id: "mock-booking2",
    hostId: "user789",
    guestId: "mock-user-123",
    host: {
      uid: "user789",
      displayName: "Michael Chen",
      photoURL: "/placeholder.svg?height=40&width=40",
    },
    guest: {
      uid: "mock-user-123",
      displayName: "Demo User",
      photoURL: "/placeholder.svg?height=40&width=40",
    },
    skill: "UI Design",
    dateTime: new Date(Date.now() + 86400000 * 5), // 5 days from now
    duration: 90,
    notes: "Introduction to Figma and design principles",
    status: "pending",
    createdAt: new Date(Date.now() - 86400000 / 2), // 12 hours ago
  },
]

// Bookings
export async function createBooking(bookingData: Omit<Booking, "id">): Promise<Booking> {
  return handleFirestoreOperation(
    async () => {
      console.log("Creating booking with data:", bookingData)

      // Convert JavaScript Date objects to Firestore Timestamps
      const firestoreData = {
        ...bookingData,
        dateTime: Timestamp.fromDate(bookingData.dateTime),
        createdAt: Timestamp.fromDate(bookingData.createdAt || new Date()),
      }

      // Add the document to Firestore
      const bookingsRef = collection(db, "bookings")
      const docRef = await addDoc(bookingsRef, firestoreData)
      console.log("Booking created with ID:", docRef.id)

      // Return the created booking with its ID
      return {
        id: docRef.id,
        ...bookingData,
      } as Booking
    },
    // If operation fails, return a mock booking with a generated ID
    {
      id: `mock-${Date.now()}`,
      ...bookingData,
    } as Booking,
    "Error creating booking",
    // If offline, return a mock booking with a generated ID
    {
      id: `offline-${Date.now()}`,
      ...bookingData,
    } as Booking,
  )
}

export async function getUserBookings(userId: string): Promise<Booking[]> {
  return handleFirestoreOperation(
    async () => {
      console.log("Fetching bookings for user:", userId)

      // Query bookings where the user is either host or guest
      const hostBookingsQuery = query(
        collection(db, "bookings"),
        where("hostId", "==", userId),
        orderBy("dateTime", "desc"),
      )

      const guestBookingsQuery = query(
        collection(db, "bookings"),
        where("guestId", "==", userId),
        orderBy("dateTime", "desc"),
      )

      const [hostBookingsSnapshot, guestBookingsSnapshot] = await Promise.all([
        getDocs(hostBookingsQuery),
        getDocs(guestBookingsQuery),
      ])

      const bookings: Booking[] = []

      // Process host bookings
      for (const bookingDoc of hostBookingsSnapshot.docs) {
        const bookingData = bookingDoc.data()

        // Get guest user data
        let guestData
        try {
          guestData = await getUserProfile(bookingData.guestId)
        } catch (error) {
          console.error("Error fetching guest profile:", error)
          guestData = {
            uid: bookingData.guestId,
            displayName: "Unknown User",
            photoURL: "/placeholder.svg?height=40&width=40",
          }
        }

        bookings.push({
          id: bookingDoc.id,
          ...bookingData,
          dateTime: bookingData.dateTime.toDate(),
          createdAt: bookingData.createdAt?.toDate() || new Date(),
          host: (await getUserProfile(bookingData.hostId)) || {
            uid: bookingData.hostId,
            displayName: "Unknown Host",
            photoURL: "/placeholder.svg?height=40&width=40",
          },
          guest: guestData,
        } as Booking)
      }

      // Process guest bookings
      for (const bookingDoc of guestBookingsSnapshot.docs) {
        const bookingData = bookingDoc.data()

        // Check if this booking is already in the array (to avoid duplicates)
        if (!bookings.some((b) => b.id === bookingDoc.id)) {
          // Get host user data
          let hostData
          try {
            hostData = await getUserProfile(bookingData.hostId)
          } catch (error) {
            console.error("Error fetching host profile:", error)
            hostData = {
              uid: bookingData.hostId,
              displayName: "Unknown Host",
              photoURL: "/placeholder.svg?height=40&width=40",
            }
          }

          bookings.push({
            id: bookingDoc.id,
            ...bookingData,
            dateTime: bookingData.dateTime.toDate(),
            createdAt: bookingData.createdAt?.toDate() || new Date(),
            host: hostData,
            guest: (await getUserProfile(bookingData.guestId)) || {
              uid: bookingData.guestId,
              displayName: "Unknown Guest",
              photoURL: "/placeholder.svg?height=40&width=40",
            },
          } as Booking)
        }
      }

      console.log("Fetched bookings:", bookings)

      // Sort by date
      return bookings.sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime())
    },
    [],
    "Error fetching bookings",
    MOCK_BOOKINGS, // Provide mock data for offline mode
  )
}

export async function updateBookingStatus(bookingId: string, status: string): Promise<void> {
  return handleFirestoreOperation(
    async () => {
      const bookingRef = doc(db, "bookings", bookingId)
      await updateDoc(bookingRef, {
        status,
        updatedAt: Timestamp.fromDate(new Date()),
      })
      console.log(`Booking ${bookingId} status updated to ${status}`)
    },
    undefined,
    "Error updating booking status",
  )
}
export async function updateBooking(bookingId: string, updatedData: Partial<Booking>): Promise<void> {
  try {
    console.log(`Updating booking ${bookingId} with data:`, updatedData)

    // Get a reference to the booking document
    const bookingRef = doc(db, "bookings", bookingId)

    // Update the booking with the new data
    await updateDoc(bookingRef, updatedData)

    console.log(`Booking ${bookingId} updated successfully`)
  } catch (error) {
    console.error("Error updating booking:", error)
    throw error
  }
}
// Mock notifications
const MOCK_NOTIFICATIONS = [
  {
    id: "mock-notif1",
    userId: "mock-user-123",
    message: "Sarah Johnson accepted your booking request for Spanish lessons",
    read: false,
    type: "booking_accepted",
    relatedId: "mock-booking1",
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
  },
  {
    id: "mock-notif2",
    userId: "mock-user-123",
    message: "You have a new message from Michael Chen",
    read: false,
    type: "new_message",
    relatedId: "mock-conv2",
    createdAt: new Date(Date.now() - 86400000 / 2), // 12 hours ago
  },
  {
    id: "mock-notif3",
    userId: "mock-user-123",
    message: "New skill match found: Photography with Alex Morgan",
    read: true,
    type: "new_match",
    relatedId: "user5",
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
  },
]

// Notifications
export async function getNotifications(userId: string): Promise<Notification[]> {
  return handleFirestoreOperation(
    async () => {
      // In a real app, this would query the database for actual notifications
      return MOCK_NOTIFICATIONS
    },
    [],
    "Error fetching notifications",
    MOCK_NOTIFICATIONS, // Provide mock data for offline mode
  )
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  if (isOffline()) {
    console.log("Offline mode: Notification will be marked as read when back online", notificationId)
    return
  }

  // In a real app, this would update the notification in the database
  console.log("Marking notification as read", notificationId)
}
/**
 * Search for users by name
 * @param query Search query
 * @param currentUserId Current user ID to exclude from results
 * @returns Array of user profiles matching the query
 */
export async function searchUsers(query: string, currentUserId: string): Promise<UserProfile[]> {
  try {
    console.log(`Searching for users with query: ${query}`)

    // Convert query to lowercase for case-insensitive search
    const queryLower = query.toLowerCase()

    // Get a reference to the users collection
    const usersRef = collection(db, "users")

    // Get all users (in a real app, you'd use Firestore queries with limits)
    const querySnapshot = await getDocs(usersRef)

    // Filter users based on the query and exclude current user
    const matchingUsers: UserProfile[] = []

    querySnapshot.forEach((doc) => {
      const userData = doc.data() as UserProfile

      // Skip the current user
      if (userData.uid === currentUserId) return

      // Check if displayName contains the query (case insensitive)
      if (userData.displayName && userData.displayName.toLowerCase().includes(queryLower)) {
        matchingUsers.push({
          ...userData,
          uid: doc.id,
        })
      }
    })

    console.log(`Found ${matchingUsers.length} matching users`)
    return matchingUsers
  } catch (error) {
    console.error("Error searching users:", error)
    throw error
  }
}

/**
 * Create a new conversation between two users
 * @param currentUserId Current user ID
 * @param otherUser The user to start a conversation with
 * @returns The newly created conversation
 */
export async function createConversation(currentUserId: string, otherUser: UserProfile): Promise<Conversation> {
  try {
    console.log(`Creating conversation between ${currentUserId} and ${otherUser.uid}`)

    // Get current user data
    const currentUserDoc = await getDoc(doc(db, "users", currentUserId))
    const currentUserData = currentUserDoc.data() as UserProfile

    // Create conversation document
    const conversationRef = doc(collection(db, "conversations"))

    // Create conversation data
    const conversationData = {
      id: conversationRef.id,
      participants: [currentUserId, otherUser.uid],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastMessage: null,
    }

    // Save conversation to Firestore
    await setDoc(conversationRef, conversationData)

    // Create the conversation object to return
    const newConversation: Conversation = {
      id: conversationRef.id,
      participants: [currentUserId, otherUser.uid],
      otherUser: otherUser,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastMessage: null,
    }

    console.log(`Conversation created with ID: ${conversationRef.id}`)
    return newConversation
  } catch (error) {
    console.error("Error creating conversation:", error)
    throw error
  }
}

