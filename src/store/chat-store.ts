import { create } from 'zustand'

export interface User {
  id: string
  name: string
  username?: string | null
  email: string
  phone?: string | null
  avatar?: string | null
  bio?: string | null
  location?: string | null
  website?: string | null
  birthday?: string | null
  jobTitle?: string | null
  company?: string | null
  linkedin?: string | null
  twitter?: string | null
  instagram?: string | null
  gender?: string | null
  language?: string | null
  timezone?: string | null
  createdAt?: Date | null
  isOnline: boolean
  lastSeen?: Date | null
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' | 'contact'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  fileMimeType?: string
  // Location specific fields
  location?: {
    latitude: number
    longitude: number
    address?: string
    name?: string
  }
  // Contact specific fields
  contact?: {
    name: string
    phone?: string
    email?: string
    avatar?: string
  }
  // Emoji reactions
  reactions?: Array<{
    emoji: string
    count: number
    byCurrentUser?: boolean
  }>
  status: 'sent' | 'delivered' | 'read'
  createdAt: Date
}

export interface Participant {
  id: string
  name: string
  avatar?: string | null
  isOnline: boolean
  lastSeen?: Date | null
  lastReadAt?: Date
}

export interface Conversation {
  id: string
  type: 'private' | 'group'
  name?: string | null
  avatar?: string | null
  lastMessage?: Message | null
  participants: Participant[]
  otherUser?: User | null
  lastMessageAt: Date
  unreadCount?: number
}

export interface TypingUser {
  userId: string
  name: string
}

interface ChatState {
  // Auth state
  currentUser: User | null
  isAuthenticated: boolean
  authLoading: boolean

  // UI state
  textSize: 'small' | 'medium' | 'large'
  currentView: 'auth' | 'chats' | 'conversation' | 'contacts' | 'calls' | 'settings' | 'profile'
  activeTab: 'message' | 'group' | 'calls' | 'contacts'
  selectedConversation: Conversation | null

  // Data state
  conversations: Conversation[]
  messages: Message[]
  onlineUsers: User[]
  typingUsers: TypingUser[]
  selectedMessageIds: string[]

  // Loading states
  conversationsLoading: boolean
  messagesLoading: boolean

  // Notification counts
  pendingFriendRequestsCount: number

  // Reply-to state
  replyToMessage: Message | null
  setReplyToMessage: (message: Message | null) => void

  // Actions
  setCurrentUser: (user: User | null) => void
  setAuthenticated: (auth: boolean) => void
  setAuthLoading: (loading: boolean) => void

  setTextSize: (size: 'small' | 'medium' | 'large') => void
  setCurrentView: (view: ChatState['currentView']) => void
  setActiveTab: (tab: ChatState['activeTab']) => void
  setSelectedConversation: (conversation: Conversation | null) => void

  setConversations: (conversations: Conversation[]) => void
  addConversation: (conversation: Conversation) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void

  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  prependMessages: (messages: Message[]) => void
  editMessage: (id: string, updates: Partial<Message>) => void
  deleteMessage: (id: string) => void
  toggleSelectMessage: (id: string) => void

  setOnlineUsers: (users: User[]) => void
  updateOnlineStatus: (userId: string, isOnline: boolean, lastSeen?: Date) => void

  setTypingUsers: (users: TypingUser[]) => void
  addTypingUser: (user: TypingUser) => void
  removeTypingUser: (userId: string) => void

  setPendingFriendRequestsCount: (count: number) => void
  updateMessageStatus: (messageId: string, status: Message['status']) => void

  logout: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  // Initial auth state
  currentUser: null,
  isAuthenticated: false,
  authLoading: false,

  // Initial UI state
  textSize: 'medium',
  currentView: 'auth',
  activeTab: 'message',
  selectedConversation: null,

  // Initial data state
  conversations: [],
  messages: [],
  onlineUsers: [],
  typingUsers: [],
  selectedMessageIds: [],

  // Initial loading states
  conversationsLoading: false,
  messagesLoading: false,

  // Initial notification counts
  pendingFriendRequestsCount: 0,

  // Initial reply-to state
  replyToMessage: null,
  setReplyToMessage: (message) => set({ replyToMessage: message }),

  // Auth actions
  setCurrentUser: (user) => set({ currentUser: user, isAuthenticated: !!user }),
  setAuthenticated: (auth) => set({ isAuthenticated: auth }),
  setAuthLoading: (loading) => set({ authLoading: loading }),

  // UI actions
  setTextSize: (size) => set({ textSize: size }),
  setCurrentView: (view) => set({ currentView: view }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedConversation: (conversation) => set({
    selectedConversation: conversation,
    currentView: conversation ? 'conversation' : 'chats'
  }),

  // Conversation actions
  setConversations: (conversations) => set({ conversations }),
  addConversation: (conversation) => set((state) => ({
    conversations: [conversation, ...state.conversations]
  })),
  updateConversation: (id, updates) => set((state) => ({
    conversations: state.conversations.map(c =>
      c.id === id ? { ...c, ...updates } : c
    )
  })),

  // Message actions
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  prependMessages: (messages) => set((state) => ({
    messages: [...messages, ...state.messages]
  })),
  editMessage: (id, updates) => set((state) => ({
    messages: state.messages.map(m => m.id === id ? { ...m, ...updates } : m),
    conversations: state.conversations.map(c =>
      c.lastMessage?.id === id ? { ...c, lastMessage: { ...c.lastMessage!, ...updates } } : c
    )
  })),

  deleteMessage: (id) => set((state) => {
    const messages = state.messages.filter(m => m.id !== id)
    // update conversations if last message was deleted
    const conversations = state.conversations.map(c => {
      if (c.lastMessage?.id !== id) return c
      // find newest remaining message for this conversation
      const lastMsg = messages
        .filter(m => m.conversationId === c.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
      return {
        ...c,
        lastMessage: lastMsg || null
      }
    })
    return { messages, conversations }
  }),
  toggleSelectMessage: (id) => set((state) => ({
    selectedMessageIds: state.selectedMessageIds.includes(id)
      ? state.selectedMessageIds.filter(x => x !== id)
      : [...state.selectedMessageIds, id]
  })),

  // Online users actions
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  updateOnlineStatus: (userId, isOnline, lastSeen) => set((state) => ({
    onlineUsers: state.onlineUsers.map(u =>
      u.id === userId ? { ...u, isOnline, lastSeen } : u
    ),
    conversations: state.conversations.map(c => ({
      ...c,
      participants: c.participants.map(p =>
        p.id === userId ? { ...p, isOnline, lastSeen } : p
      ),
      otherUser: c.otherUser?.id === userId
        ? { ...c.otherUser, isOnline, lastSeen }
        : c.otherUser
    }))
  })),

  // Typing actions
  setTypingUsers: (users) => set({ typingUsers: users }),
  addTypingUser: (user) => set((state) => ({
    typingUsers: [...state.typingUsers.filter(u => u.userId !== user.userId), user]
  })),
  removeTypingUser: (userId) => set((state) => ({
    typingUsers: state.typingUsers.filter(u => u.userId !== userId)
  })),

  setPendingFriendRequestsCount: (count) => set({ pendingFriendRequestsCount: count }),
  updateMessageStatus: (messageId, status) => set((state) => ({
    messages: state.messages.map(m =>
      m.id === messageId ? { ...m, status } : m
    ),
    conversations: state.conversations.map(c =>
      c.lastMessage?.id === messageId
        ? { ...c, lastMessage: { ...c.lastMessage, status } }
        : c
    )
  })),
  // selection actions
  toggleSelectMessage: (id) => set((state) => ({
    selectedMessageIds: state.selectedMessageIds.includes(id)
      ? state.selectedMessageIds.filter(x => x !== id)
      : [...state.selectedMessageIds, id]
  })),

  // Logout
  logout: () => set({
    currentUser: null,
    isAuthenticated: false,
    currentView: 'auth',
    selectedConversation: null,
    conversations: [],
    messages: [],
    onlineUsers: [],
    typingUsers: []
  })
}))
