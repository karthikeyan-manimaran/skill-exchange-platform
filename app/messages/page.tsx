"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Send, Paperclip, Smile, Image, X, UserPlus, Search, MoreVertical, Edit, Trash2, Check } from "lucide-react"
import { format } from "date-fns"

import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import {
  getConversations,
  sendMessage,
  subscribeToMessages,
  searchUsers,
  createConversation,
  deleteConversation,
  editMessage,
  deleteMessage,
} from "@/lib/firebase/firestore"
import type { Conversation, Message as MessageType, UserProfile } from "@/lib/types"
import { AppLayout } from "@/components/app-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function MessagesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<MessageType[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isOnline, setIsOnline] = useState(true)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false)
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showCreateChatDialog, setShowCreateChatDialog] = useState(false)
  const [newChatUser, setNewChatUser] = useState<UserProfile | null>(null)
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingMessage, setEditingMessage] = useState<MessageType | null>(null)
  const [editedText, setEditedText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)
  const editInputRef = useRef<HTMLTextAreaElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const attachmentOptionsRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Check online status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    if (!user) return

    async function fetchConversations() {
      try {
        setIsLoading(true)
        const conversationsData = await getConversations(user.uid)
        setConversations(conversationsData)
        if (conversationsData.length > 0 && !activeConversation) {
          setActiveConversation(conversationsData[0])
        }
      } catch (error) {
        console.error("Error fetching conversations:", error)
        toast({
          title: "Error loading conversations",
          description: "Failed to load your conversations. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()
  }, [user, toast, activeConversation])

  useEffect(() => {
    if (!activeConversation || !user) return

    // Reset messages when changing conversations
    setMessages([])

    const unsubscribe = subscribeToMessages(activeConversation.id, (newMessages) => {
      setMessages(newMessages)
      scrollToBottom()
    })

    return () => unsubscribe()
  }, [activeConversation, user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle clicks outside emoji picker and attachment options
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        event.target !== document.getElementById("emoji-button")
      ) {
        setShowEmojiPicker(false)
      }

      if (
        attachmentOptionsRef.current &&
        !attachmentOptionsRef.current.contains(event.target as Node) &&
        event.target !== document.getElementById("attachment-button")
      ) {
        setShowAttachmentOptions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Focus edit input when editing a message
  useEffect(() => {
    if (editingMessage && editInputRef.current) {
      editInputRef.current.focus()
    }
  }, [editingMessage])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !activeConversation || !user) return

    if (!isOnline) {
      toast({
        title: "You're offline",
        description: "Your message will be sent when you're back online.",
      })
    }

    try {
      setIsSending(true)

      // Actually send the message
      await sendMessage(activeConversation.id, {
        senderId: user.uid,
        text: newMessage,
        timestamp: new Date(),
      })

      // Clear the input
      setNewMessage("")

      // Focus the input after sending
      messageInputRef.current?.focus()
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Failed to send message",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e as unknown as React.FormEvent)
    }
  }

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSaveEdit()
    } else if (e.key === "Escape") {
      setEditingMessage(null)
    }
  }

  const handleEmojiClick = (emoji: string) => {
    setNewMessage((prev) => prev + emoji)
    setShowEmojiPicker(false)
    messageInputRef.current?.focus()
  }

  const handleAttachmentClick = (type: string) => {
    // This would normally open a file picker
    toast({
      title: `${type} attachment`,
      description: `You selected to attach a ${type.toLowerCase()}.`,
    })
    setShowAttachmentOptions(false)
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)

    // If query is empty, clear search results
    if (!query.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    // Search for users
    if (user && query.trim().length >= 2) {
      setIsSearching(true)
      try {
        const results = await searchUsers(query, user.uid)
        setSearchResults(results)
      } catch (error) {
        console.error("Error searching users:", error)
        toast({
          title: "Search failed",
          description: "Failed to search for users. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsSearching(false)
      }
    }
  }

  const handleCreateChat = async () => {
    if (!user || !newChatUser) return

    setIsCreatingChat(true)

    try {
      // Check if conversation already exists
      const existingConversation = conversations.find((conv) => conv.otherUser.uid === newChatUser.uid)

      if (existingConversation) {
        setActiveConversation(existingConversation)
        setShowCreateChatDialog(false)
        setSearchQuery("")
        setSearchResults([])
        toast({
          title: "Conversation exists",
          description: `You already have a conversation with ${newChatUser.displayName}.`,
        })
        return
      }

      // Create new conversation
      const newConversation = await createConversation(user.uid, newChatUser)

      // Add to conversations list and set as active
      setConversations((prev) => [newConversation, ...prev])
      setActiveConversation(newConversation)

      // Reset search and dialog
      setShowCreateChatDialog(false)
      setSearchQuery("")
      setSearchResults([])
      setNewChatUser(null)

      toast({
        title: "Chat created",
        description: `You can now chat with ${newChatUser.displayName}.`,
      })
    } catch (error) {
      console.error("Error creating conversation:", error)
      toast({
        title: "Failed to create chat",
        description: "There was an error creating the conversation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingChat(false)
    }
  }

  const handleDeleteConversation = async () => {
    if (!activeConversation) return

    setIsDeleting(true)

    try {
      await deleteConversation(activeConversation.id)

      // Remove from conversations list
      setConversations((prev) => prev.filter((conv) => conv.id !== activeConversation.id))

      // Clear active conversation
      setActiveConversation(null)

      toast({
        title: "Conversation deleted",
        description: "The conversation has been permanently deleted.",
      })
    } catch (error) {
      console.error("Error deleting conversation:", error)
      toast({
        title: "Failed to delete conversation",
        description: "There was an error deleting the conversation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleEditMessage = (message: MessageType) => {
    setEditingMessage(message)
    setEditedText(message.text)
  }

  const handleSaveEdit = async () => {
    if (!editingMessage || !activeConversation || !editedText.trim()) return

    try {
      await editMessage(activeConversation.id, editingMessage.id, editedText)

      // Update the message in the UI
      setMessages((prev) =>
        prev.map((msg) => (msg.id === editingMessage.id ? { ...msg, text: editedText, isEdited: true } : msg)),
      )

      // Clear editing state
      setEditingMessage(null)

      toast({
        title: "Message updated",
        description: "Your message has been edited.",
      })
    } catch (error) {
      console.error("Error editing message:", error)
      toast({
        title: "Failed to edit message",
        description: "There was an error editing your message. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!activeConversation) return

    try {
      await deleteMessage(activeConversation.id, messageId)

      // Remove the message from the UI
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId))

      toast({
        title: "Message deleted",
        description: "Your message has been deleted.",
      })
    } catch (error) {
      console.error("Error deleting message:", error)
      toast({
        title: "Failed to delete message",
        description: "There was an error deleting your message. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openCreateChatDialog = (user: UserProfile) => {
    setNewChatUser(user)
    setShowCreateChatDialog(true)
  }

  const filteredConversations = conversations.filter((conversation) =>
    conversation.otherUser.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatTime = (date: Date) => {
    return format(new Date(date), "h:mm a")
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const messageDate = new Date(date)

    if (
      messageDate.getDate() === today.getDate() &&
      messageDate.getMonth() === today.getMonth() &&
      messageDate.getFullYear() === today.getFullYear()
    ) {
      return "Today"
    }

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (
      messageDate.getDate() === yesterday.getDate() &&
      messageDate.getMonth() === yesterday.getMonth() &&
      messageDate.getFullYear() === yesterday.getFullYear()
    ) {
      return "Yesterday"
    }

    return format(messageDate, "EEEE, MMMM d")
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups: Record<string, MessageType[]>, message) => {
    const date = formatDate(message.timestamp)

    if (!groups[date]) {
      groups[date] = []
    }

    groups[date].push(message)

    return groups
  }, {})

  return (
    <AppLayout showSearch={false}>
      <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-lg border bg-card shadow">
        {/* Contacts sidebar */}
        <div className="w-full max-w-xs border-r">
          <div className="flex h-full flex-col">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Conversations</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    setSearchQuery("")
                    setSearchResults([])
                    if (searchInputRef.current) {
                      searchInputRef.current.focus()
                    }
                  }}
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search people..."
                  className="pl-9 w-full"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>

            {!isOnline && (
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-800 dark:text-amber-200 flex items-center">
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-500 mr-2"></span>
                  Offline mode
                </p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="h-10 w-10 rounded-full bg-muted"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 w-24 bg-muted rounded"></div>
                          <div className="h-3 w-32 bg-muted rounded"></div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : searchQuery && searchResults.length > 0 ? (
                // Show search results
                <div className="divide-y">
                  <div className="p-2 bg-muted/50">
                    <p className="text-xs text-muted-foreground">Search Results</p>
                  </div>
                  {searchResults.map((userProfile) => (
                    <button
                      key={userProfile.uid}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted transition-colors"
                      onClick={() => openCreateChatDialog(userProfile)}
                    >
                      <Avatar>
                        <AvatarImage src={userProfile.photoURL || "/placeholder.svg?height=40&width=40"} />
                        <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                          {userProfile.displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{userProfile.displayName}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {userProfile.location || "No location"}
                        </p>
                      </div>
                      <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              ) : searchQuery && !isSearching && searchResults.length === 0 ? (
                // No search results found
                <div className="flex flex-col items-center justify-center h-40 p-4 text-center">
                  <p className="text-muted-foreground mb-2">No users found</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Create a mock user for demonstration
                      const mockUser: UserProfile = {
                        uid: `new-user-${Date.now()}`,
                        displayName: searchQuery,
                        photoURL: "/placeholder.svg?height=40&width=40",
                        location: "New User",
                        skillsOffered: [],
                        skillsWanted: [],
                      }
                      openCreateChatDialog(mockUser)
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create chat with "{searchQuery}"
                  </Button>
                </div>
              ) : filteredConversations.length > 0 ? (
                // Show existing conversations
                <div className="divide-y">
                  {filteredConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      className={`w-full flex items-center gap-3 p-3 text-left hover:bg-muted transition-colors ${
                        activeConversation?.id === conversation.id ? "bg-muted" : ""
                      }`}
                      onClick={() => setActiveConversation(conversation)}
                    >
                      <Avatar>
                        <AvatarImage src={conversation.otherUser.photoURL || "/placeholder.svg?height=40&width=40"} />
                        <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                          {conversation.otherUser.displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <p className="font-medium truncate">{conversation.otherUser.displayName}</p>
                          {conversation.lastMessage && (
                            <span className="text-xs text-muted-foreground">
                              {formatTime(conversation.lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        {conversation.lastMessage && (
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage.senderId === user?.uid ? "You: " : ""}
                            {conversation.lastMessage.text}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <p className="text-muted-foreground mb-2">No conversations found</p>
                  <p className="text-xs text-muted-foreground">Start a new conversation by searching for a user</p>
                </div>
              )}

              {isSearching && (
                <div className="p-4 flex justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={activeConversation.otherUser.photoURL || "/placeholder.svg?height=40&width=40"} />
                    <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                      {activeConversation.otherUser.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold">{activeConversation.otherUser.displayName}</h2>
                    <p className="text-xs text-muted-foreground">{activeConversation.otherUser.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={isOnline ? "default" : "outline"} className={isOnline ? "bg-green-500" : ""}>
                    {isOnline ? "Online" : "Offline"}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                  <div key={date} className="space-y-4">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute inset-0 border-t border-border"></div>
                      <div className="relative bg-card px-2 text-xs text-muted-foreground">{date}</div>
                    </div>

                    {dateMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === user?.uid ? "justify-end" : "justify-start"}`}
                      >
                        {editingMessage?.id === message.id ? (
                          <div className="max-w-[80%] w-full">
                            <div className="flex items-end gap-2">
                              <textarea
                                ref={editInputRef}
                                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none min-h-[40px]"
                                value={editedText}
                                onChange={(e) => setEditedText(e.target.value)}
                                onKeyDown={handleEditKeyDown}
                                rows={2}
                              />
                              <Button size="icon" className="h-8 w-8 bg-primary" onClick={handleSaveEdit}>
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() => setEditingMessage(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="group relative">
                            <div
                              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                message.senderId === user?.uid
                                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm">{message.text}</p>
                              <div className="flex items-center justify-end gap-1 mt-1">
                                {message.isEdited && <span className="text-xs opacity-70">(edited)</span>}
                                <p className="text-xs opacity-70">{formatTime(message.timestamp)}</p>
                              </div>
                            </div>

                            {message.senderId === user?.uid && (
                              <div className="absolute top-0 right-0 -mt-2 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="secondary" size="icon" className="h-6 w-6 rounded-full">
                                      <MoreVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-32">
                                    <DropdownMenuItem onClick={() => handleEditMessage(message)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive"
                                      onClick={() => handleDeleteMessage(message.id)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
                <div ref={messagesEndRef} />

                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <div className="text-4xl mb-2">👋</div>
                    <h3 className="text-lg font-medium mb-1">Start a conversation</h3>
                    <p className="text-sm text-muted-foreground">
                      Send a message to {activeConversation.otherUser.displayName}
                    </p>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="border-t p-4 flex items-end gap-2">
                <div className="relative">
                  <Button
                    type="button"
                    id="attachment-button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>

                  {showAttachmentOptions && (
                    <div
                      ref={attachmentOptionsRef}
                      className="absolute bottom-full left-0 mb-2 p-2 bg-card rounded-lg border shadow-lg z-10 w-48"
                    >
                      <div className="space-y-1">
                        <button
                          type="button"
                          className="w-full flex items-center gap-2 p-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
                          onClick={() => handleAttachmentClick("Photo")}
                        >
                          <Image className="h-4 w-4" />
                          <span>Photo</span>
                        </button>
                        <button
                          type="button"
                          className="w-full flex items-center gap-2 p-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
                          onClick={() => handleAttachmentClick("File")}
                        >
                          <Paperclip className="h-4 w-4" />
                          <span>File</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 relative">
                  <textarea
                    ref={messageInputRef}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none min-h-[40px] max-h-[120px]"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                  />
                </div>

                <div className="relative">
                  <Button
                    type="button"
                    id="emoji-button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Smile className="h-5 w-5" />
                  </Button>

                  {showEmojiPicker && (
                    <div
                      ref={emojiPickerRef}
                      className="absolute bottom-full right-0 mb-2 p-2 bg-card rounded-lg border shadow-lg z-10"
                    >
                      <div className="flex justify-between items-center mb-2 pb-1 border-b">
                        <span className="text-xs font-medium">Emojis</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => setShowEmojiPicker(false)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-8 gap-1">
                        {[
                          "😀",
                          "😂",
                          "😊",
                          "😍",
                          "🥰",
                          "😎",
                          "😢",
                          "😭",
                          "😡",
                          "🥳",
                          "🤔",
                          "👍",
                          "👎",
                          "❤️",
                          "🔥",
                          "🎉",
                        ].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            className="flex items-center justify-center h-8 w-8 rounded hover:bg-muted transition-colors"
                            onClick={() => handleEmojiClick(emoji)}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  size="icon"
                  className="h-9 w-9 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  disabled={!newMessage.trim() || isSending}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="text-5xl mb-4">💬</div>
              <h2 className="text-2xl font-bold mb-2">No conversation selected</h2>
              <p className="text-muted-foreground mb-6">Select a conversation from the sidebar or start a new one</p>
              <Button
                onClick={() => {
                  setSearchQuery("")
                  if (searchInputRef.current) {
                    searchInputRef.current.focus()
                  }
                }}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Start a new conversation
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create Chat Dialog */}
      <Dialog open={showCreateChatDialog} onOpenChange={setShowCreateChatDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Conversation</DialogTitle>
            <DialogDescription>Start chatting with {newChatUser?.displayName}</DialogDescription>
          </DialogHeader>

          {newChatUser && (
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src={newChatUser.photoURL || "/placeholder.svg?height=48&width=48"} />
                <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                  {newChatUser.displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{newChatUser.displayName}</h3>
                <p className="text-sm text-muted-foreground">{newChatUser.location || "No location"}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateChatDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateChat}
              disabled={isCreatingChat}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              {isCreatingChat ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Conversation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Conversation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone and all messages will be
              permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConversation}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}

