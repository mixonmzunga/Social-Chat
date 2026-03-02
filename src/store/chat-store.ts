import { create } from 'zustand'

export interface User {
  id: string
  name: string
  username?: string | null
  email: string
  phone?: string | null
  avatar?: string | null
  bio?: string | null
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
  type: 'text' | 'image' | 'file' | 'audio'
  fileUrl?: string
  fileName?: string
  fileSize?: number
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
  currentView: 'auth' | 'chats' | 'conversation' | 'contacts' | 'calls' | 'settings' | 'profile'
  activeTab: 'message' | 'group' | 'calls' | 'contacts'
  selectedConversation: Conversation | null
  
  // Data state
  conversations: Conversation[]
  messages: Message[]
  onlineUsers: User[]
  typingUsers: TypingUser[]
  
  // Loading states
  conversationsLoading: boolean
  messagesLoading: boolean
  
  // Actions
  setCurrentUser: (user: User | null) => void
  setAuthenticated: (auth: boolean) => void
  setAuthLoading: (loading: boolean) => void
  
  setCurrentView: (view: ChatState['currentView']) => void
  setActiveTab: (tab: ChatState['activeTab']) => void
  setSelectedConversation: (conversation: Conversation | null) => void
  
  setConversations: (conversations: Conversation[]) => void
  addConversation: (conversation: Conversation) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void
  
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  prependMessages: (messages: Message[]) => void
  
  setOnlineUsers: (users: User[]) => void
  updateOnlineStatus: (userId: string, isOnline: boolean, lastSeen?: Date) => void
  
  setTypingUsers: (users: TypingUser[]) => void
  addTypingUser: (user: TypingUser) => void
  removeTypingUser: (userId: string) => void
  
  logout: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  // Initial auth state
  currentUser: null,
  isAuthenticated: false,
  authLoading: false,
  
  // Initial UI state
  currentView: 'auth',
  activeTab: 'message',
  selectedConversation: null,
  
  // Initial data state
  conversations: [],
  messages: [],
  onlineUsers: [],
  typingUsers: [],
  
  // Initial loading states
  conversationsLoading: false,
  messagesLoading: false,
  
  // Auth actions
  setCurrentUser: (user) => set({ currentUser: user, isAuthenticated: !!user }),
  setAuthenticated: (auth) => set({ isAuthenticated: auth }),
  setAuthLoading: (loading) => set({ authLoading: loading }),
  
  // UI actions
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
