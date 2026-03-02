'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import EmojiPicker, { Theme, EmojiClickData } from 'emoji-picker-react'
import { 
  MessageCircle, Users, Settings, Search, Plus, 
  MoreVertical, Phone, Video, LogOut, Moon, Sun,
  ArrowLeft, Check, CheckCheck, Send, Paperclip, Smile, Mic,
  X, Loader2, PhoneIncoming, PhoneOutgoing, PhoneMissed, UserPlus,
  User, Ban, Star, Download, Trash2, AlertCircle, Image as ImageIcon
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useChatStore, Message } from '@/store/chat-store'
import { useSocket } from '@/hooks/useSocket'
import { useTheme } from 'next-themes'
import { format, isToday, isYesterday } from 'date-fns'

export function DesktopLayout() {
  const {
    currentUser,
    conversations,
    setConversations,
    selectedConversation,
    setSelectedConversation,
    currentView,
    setCurrentView,
    activeTab,
    setActiveTab,
    messages,
    setMessages,
    addMessage,
    typingUsers,
    logout,
    onlineUsers
  } = useChatStore()
  
  const { theme, setTheme } = useTheme()
  const { sendMessage, startTyping, stopTyping } = useSocket()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNewChat, setShowNewChat] = useState(false)
  const [messageInput, setMessageInput] = useState('')
  const [sending, setSending] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showChatMenu, setShowChatMenu] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  
  const userMenuRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  
  const [isMobile, setIsMobile] = useState(false)
  
  // Handle emoji click
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessageInput((prev) => prev + emojiData.emoji)
    handleTyping()
  }
  
  // Close emoji picker on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUser) return
      setLoading(true)
      try {
        const response = await fetch(`/api/conversations?userId=${currentUser.id}`)
        const data = await response.json()
        setConversations(data.conversations || [])
      } catch (error) {
        console.error('Failed to fetch conversations:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchConversations()
  }, [currentUser, setConversations])

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return
      try {
        const response = await fetch(
          `/api/messages?conversationId=${selectedConversation.id}&limit=50`
        )
        const data = await response.json()
        setMessages(data.messages || [])
      } catch (error) {
        console.error('Failed to fetch messages:', error)
      }
    }
    fetchMessages()
  }, [selectedConversation, setMessages])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = !searchQuery || 
      conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === 'group' ? conv.type === 'group' : conv.type === 'private' || activeTab === 'message'
    return matchesSearch && matchesTab
  })

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatTime = (date: Date | string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    
    if (diff < 86400000) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diff < 604800000) {
      return d.toLocaleDateString([], { weekday: 'short' })
    } else {
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    if (isToday(d)) return 'Today'
    if (isYesterday(d)) return 'Yesterday'
    return format(d, 'MMMM d, yyyy')
  }

  const handleLogout = async () => {
    if (currentUser) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      })
    }
    logout()
  }

  const handleSelectConversation = (conv: any) => {
    setSelectedConversation(conv)
    setCurrentView('conversation')
  }

  const handleBack = () => {
    setSelectedConversation(null)
    setCurrentView('chats')
    setMessages([])
  }

  // Handle typing
  const handleTyping = () => {
    if (!currentUser || !selectedConversation) return
    startTyping(selectedConversation.id, currentUser.id, currentUser.name)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(selectedConversation.id, currentUser.id)
    }, 2000)
  }

  // Send message
  const handleSend = async () => {
    if (!messageInput.trim() || !currentUser || !selectedConversation) return
    
    setSending(true)
    const content = messageInput.trim()
    setMessageInput('')
    stopTyping(selectedConversation.id, currentUser.id)
    
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId: selectedConversation.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar || undefined,
      content,
      type: 'text',
      status: 'sent',
      createdAt: new Date()
    }
    
    addMessage(tempMessage)

    try {
      // sendMessage already saves to database via API
      await sendMessage({
        conversationId: selectedConversation.id,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar || undefined,
        content,
        type: 'text'
      })
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups: { date: string; messages: Message[] }[], message) => {
    const date = formatDate(message.createdAt)
    const existingGroup = groups.find(g => g.date === date)
    if (existingGroup) {
      existingGroup.messages.push(message)
    } else {
      groups.push({ date, messages: [message] })
    }
    return groups
  }, [])

  // Render main content
  const renderMainContent = () => {
    if (currentView === 'settings') {
      return <SettingsView onBack={handleBack} />
    }
    if (currentView === 'profile') {
      return <ProfileView onBack={handleBack} />
    }
    if (currentView === 'contacts') {
      return <ContactsView onBack={handleBack} />
    }
    if (currentView === 'calls') {
      return <CallsView onBack={handleBack} />
    }
    if (selectedConversation) {
      const otherName = selectedConversation.name || selectedConversation.otherUser?.name || 'Unknown'
      const otherAvatar = selectedConversation.avatar || selectedConversation.otherUser?.avatar
      const otherUserId = selectedConversation.otherUser?.id
      
      // Get real-time online status from onlineUsers array
      const onlineUser = onlineUsers.find(u => u.id === otherUserId)
      const isOnline = onlineUser?.isOnline ?? selectedConversation.otherUser?.isOnline ?? false
      const lastSeen = onlineUser?.lastSeen ?? selectedConversation.otherUser?.lastSeen
      
      // Only show typing indicator if the OTHER person is typing
      const isOtherUserTyping = typingUsers.some(
        u => u.userId === otherUserId && u.userId !== currentUser?.id
      )
      
      // Format last seen with better time display
      const formatLastSeen = (date: Date | string | null | undefined) => {
        if (!date) return 'offline'
        const d = new Date(date)
        const now = new Date()
        const diffMs = now.getTime() - d.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)
        
        if (diffMins < 1) return 'just now'
        if (diffMins < 60) return `${diffMins} min ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays === 1) return 'yesterday'
        if (diffDays < 7) return `${diffDays} days ago`
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
      }

      const menuItems = [
        { icon: User, label: 'Contact info', action: () => setActiveModal('contact') },
        { icon: Ban, label: 'Block', action: () => setActiveModal('block'), danger: true },
        { icon: Sun, label: 'Chat theme', action: () => setActiveModal('theme') },
        { icon: ImageIcon, label: 'Wallpaper', action: () => setActiveModal('wallpaper') },
        { icon: Star, label: 'Add to favorites', action: () => setActiveModal('favorites') },
        { icon: Download, label: 'Export chat', action: () => setActiveModal('export') },
        { icon: Trash2, label: 'Delete chat', action: () => setActiveModal('delete'), danger: true },
      ]

      return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-slate-800">
          {/* Header */}
          <header className="bg-[#075e54] dark:bg-slate-900 px-3 py-2.5 border-b border-gray-200 dark:border-slate-700 flex items-center gap-2 flex-shrink-0 relative">
            {isMobile && (
              <button
                onClick={handleBack}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* Avatar with online indicator */}
              <div className="relative flex-shrink-0">
                <Avatar className="w-9 h-9">
                  <AvatarImage src={otherAvatar || undefined} />
                  <AvatarFallback className="bg-gray-300 dark:bg-slate-600 text-gray-700 dark:text-gray-200 text-sm">
                    {getInitials(otherName)}
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator on avatar */}
                {isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[#075e54] dark:border-slate-900" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-white truncate text-sm">{otherName}</h2>
                <div className="text-xs">
                  {isOtherUserTyping ? (
                    <span className="text-green-300 font-medium">typing...</span>
                  ) : isOnline ? (
                    <span className="text-green-300 font-medium">online</span>
                  ) : (
                    <span className="text-white/70">last seen {formatLastSeen(lastSeen)}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                <Phone className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <Search className="w-5 h-5" />
              </button>
              <button 
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                onClick={() => setShowChatMenu(!showChatMenu)}
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showChatMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute top-full right-3 mt-1 bg-slate-700 rounded-xl shadow-xl overflow-hidden z-[100] min-w-[180px]"
                >
                  {menuItems.map((item, index) => (
                    <button
                      key={index}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors ${
                        item.danger ? 'text-red-400' : 'text-white'
                      }`}
                      onClick={() => {
                        setShowChatMenu(false)
                        item.action()
                      }}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </header>

          {/* Modal Overlay */}
          <AnimatePresence>
            {activeModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
                onClick={() => setActiveModal(null)}
              >
                {/* Contact Info Modal */}
                {activeModal === 'contact' && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-slate-800 rounded-2xl w-full max-w-sm overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-6 text-center border-b border-white/10">
                      <Avatar className="w-20 h-20 mx-auto mb-3 ring-4 ring-white/10">
                        <AvatarImage src={otherAvatar || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl font-semibold">
                          {getInitials(otherName)}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-xl font-semibold text-white">{otherName}</h3>
                      <p className="text-gray-400 text-sm mt-1">+1 234 567 8900</p>
                    </div>
                    
                    <div className="p-4 space-y-4">
                      <div className="bg-slate-700 rounded-xl p-4">
                        <p className="text-xs text-purple-400 uppercase tracking-wider mb-2">About</p>
                        <p className="text-white text-sm">Available</p>
                      </div>

                      <div className="bg-slate-700 rounded-xl p-4">
                        <p className="text-xs text-purple-400 uppercase tracking-wider mb-2">Media, links and docs</p>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="aspect-square bg-slate-600 rounded-lg" />
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <button className="w-full flex items-center gap-3 p-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors">
                          <AlertCircle className="w-5 h-5 text-gray-400" />
                          <span className="text-white text-sm">Report contact</span>
                        </button>
                        <button className="w-full flex items-center gap-3 p-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors">
                          <Ban className="w-5 h-5 text-red-400" />
                          <span className="text-red-400 text-sm">Block contact</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 border-t border-white/10">
                      <Button
                        variant="outline"
                        className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
                        onClick={() => setActiveModal(null)}
                      >
                        Close
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Block Modal */}
                {activeModal === 'block' && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-slate-800 rounded-2xl w-full max-w-sm overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-6 text-center">
                      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Ban className="w-8 h-8 text-red-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Block {otherName}?</h3>
                      <p className="text-gray-400 text-sm mb-6">
                        Blocked contacts will no longer be able to call you or send you messages.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
                          onClick={() => setActiveModal(null)}
                        >
                          Cancel
                        </Button>
                        <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white">
                          Block
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Theme Modal */}
                {activeModal === 'theme' && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-slate-800 rounded-2xl w-full max-w-sm overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                      <h3 className="text-lg font-semibold text-white">Chat Theme</h3>
                      <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="p-4">
                      <p className="text-sm text-gray-400 mb-4">Choose a theme</p>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { name: 'Purple', gradient: 'from-purple-600 to-blue-500' },
                          { name: 'Ocean', gradient: 'from-cyan-500 to-blue-500' },
                          { name: 'Sunset', gradient: 'from-orange-500 to-pink-500' },
                          { name: 'Forest', gradient: 'from-green-500 to-teal-500' },
                          { name: 'Cotton', gradient: 'from-pink-500 to-violet-500' },
                          { name: 'Dark', gradient: 'from-gray-600 to-gray-800' },
                        ].map((t) => (
                          <button
                            key={t.name}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-all"
                          >
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.gradient}`} />
                            <span className="text-xs text-gray-400">{t.name}</span>
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex gap-3 mt-6">
                        <Button
                          variant="outline"
                          className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
                          onClick={() => setActiveModal(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                          onClick={() => setActiveModal(null)}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Wallpaper Modal */}
                {activeModal === 'wallpaper' && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-slate-800 rounded-2xl w-full max-w-sm overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                      <h3 className="text-lg font-semibold text-white">Chat Wallpaper</h3>
                      <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-3">
                        {['Default', 'Dots', 'Lines', 'Gradient'].map((name) => (
                          <button key={name} className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors">
                            <div className="w-full aspect-[9/16] rounded-xl bg-slate-600" />
                            <span className="text-xs text-gray-400">{name}</span>
                          </button>
                        ))}
                      </div>
                      
                      <Button
                        className="w-full mt-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                        onClick={() => setActiveModal(null)}
                      >
                        Set Wallpaper
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Favorites Modal */}
                {activeModal === 'favorites' && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-slate-800 rounded-2xl w-full max-w-sm overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-6 text-center">
                      <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="w-8 h-8 text-yellow-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Add to Favorites?</h3>
                      <p className="text-gray-400 text-sm mb-6">
                        {otherName} will be added to your favorite contacts for quick access.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
                          onClick={() => setActiveModal(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                          onClick={() => setActiveModal(null)}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Export Modal */}
                {activeModal === 'export' && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-slate-800 rounded-2xl w-full max-w-sm overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-6 text-center">
                      <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Download className="w-8 h-8 text-purple-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Export Chat?</h3>
                      <p className="text-gray-400 text-sm mb-4">
                        The chat will be exported as a .txt file
                      </p>
                      <label className="flex items-center gap-2 text-sm text-gray-300 mb-6 justify-center">
                        <input type="checkbox" defaultChecked className="accent-purple-500" />
                        Include media files
                      </label>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
                          onClick={() => setActiveModal(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                        >
                          Export
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Delete Modal */}
                {activeModal === 'delete' && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-slate-800 rounded-2xl w-full max-w-sm overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-6 text-center">
                      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="w-8 h-8 text-red-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Delete this chat?</h3>
                      <p className="text-gray-400 text-sm mb-6">
                        Messages will only be removed from your device. This action cannot be undone.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
                          onClick={() => setActiveModal(null)}
                        >
                          Cancel
                        </Button>
                        <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white">
                          Delete
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Bar */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-3 overflow-hidden flex-shrink-0"
              >
                <Input
                  placeholder="Search messages..."
                  className="my-2 bg-gray-100 dark:bg-slate-800 border-0 h-9"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto min-h-0 p-3 space-y-1 chat-bg-pattern">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mb-3">
                  <Send className="w-8 h-8 text-teal-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No messages yet. Say hello! 👋
                </p>
              </div>
            ) : (
              groupedMessages.map((group) => (
                <div key={group.date}>
                  <div className="flex items-center justify-center my-3">
                    <span className="px-3 py-1 bg-white/80 dark:bg-slate-700/80 rounded-full text-xs text-gray-600 dark:text-gray-300 shadow-sm backdrop-blur-sm">
                      {group.date}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    {group.messages.map((message, index) => {
                      const isOwn = message.senderId === currentUser?.id
                      
                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'} message-bubble`}
                        >
                          <div
                            className={`max-w-[60%] px-3 py-1.5 ${
                              isOwn
                                ? 'bg-[#dcf8c6] dark:bg-teal-700 text-gray-900 dark:text-white rounded-lg'
                                : 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg shadow-sm'
                            }`}
                          >
                            {!isOwn && selectedConversation.type === 'group' && (
                              <p className="text-xs text-teal-600 dark:text-teal-300 font-medium mb-0.5">
                                {message.senderName}
                              </p>
                            )}
                            
                            <p className="text-sm break-words leading-relaxed">{message.content}</p>
                            
                            <div className={`flex items-center justify-end gap-1 mt-0.5 ${
                              isOwn ? 'text-gray-500 dark:text-gray-300' : 'text-gray-400'
                            }`}>
                              <span className="text-[10px]">
                                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isOwn && (
                                message.status === 'read' ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                                ) : message.status === 'delivered' ? (
                                  <CheckCheck className="w-3.5 h-3.5" />
                                ) : (
                                  <Check className="w-3.5 h-3.5" />
                                )
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
            
            {/* Typing Indicator */}
            <AnimatePresence>
              {isOtherUserTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex justify-start"
                >
                  <div className="bg-white dark:bg-slate-700 px-3 py-2 rounded-lg shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot" />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot" />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-gray-100 dark:bg-slate-900 p-2.5 flex-shrink-0 relative">
            {/* Emoji Picker */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-0 mb-2 z-50"
                  ref={emojiPickerRef}
                >
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT}
                    width={350}
                    height={400}
                    searchDisabled
                    skinTonesDisabled
                    previewConfig={{ showPreview: false }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-full px-3 py-1">
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-1.5 transition-colors flex-shrink-0 ${showEmojiPicker ? 'text-teal-500' : 'text-gray-400 hover:text-teal-500'}`}
              >
                <Smile className="w-5 h-5" />
              </button>
              
              <Input
                value={messageInput}
                onChange={(e) => {
                  setMessageInput(e.target.value)
                  handleTyping()
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-0 focus-visible:ring-0 text-sm"
              />
              
              <button className="p-1.5 text-gray-400 hover:text-teal-500 transition-colors flex-shrink-0">
                <Paperclip className="w-5 h-5" />
              </button>
              
              {messageInput.trim() ? (
                <button
                  onClick={handleSend}
                  disabled={sending}
                  className="p-2 bg-[#075e54] hover:bg-[#064e47] rounded-full text-white transition-colors flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              ) : (
                <button className="p-1.5 text-gray-400 hover:text-teal-500 transition-colors flex-shrink-0">
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )
    }
    
    // Empty state
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-800 p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
            <MessageCircle className="w-12 h-12 text-teal-500" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            LoyalChat Web
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Send and receive messages on your computer. Select a conversation to start chatting.
          </p>
          <Button
            onClick={() => setShowNewChat(true)}
            className="bg-[#075e54] hover:bg-[#064e47]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Start New Chat
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full flex bg-gray-100 dark:bg-slate-900">
      {/* Left Sidebar */}
      <div className="w-80 lg:w-96 flex-shrink-0 flex flex-col bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 overflow-hidden">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full p-1.5 transition-colors"
            >
              <Avatar className="w-9 h-9">
                <AvatarImage src={currentUser?.avatar || undefined} />
                <AvatarFallback className="bg-[#075e54] text-white text-sm">
                  {currentUser ? getInitials(currentUser.name) : '?'}
                </AvatarFallback>
              </Avatar>
            </button>
            
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 w-60 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-gray-200 dark:border-slate-700">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{currentUser?.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{currentUser?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setCurrentView('profile')
                        setShowUserMenu(false)
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300"
                    >
                      <UserIcon className="w-5 h-5" />
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setCurrentView('contacts')
                        setShowUserMenu(false)
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300"
                    >
                      <Users className="w-5 h-5" />
                      <span>Contacts</span>
                    </button>
                    <button
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300"
                    >
                      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                      <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setCurrentView('settings')
                        setShowUserMenu(false)
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300"
                    >
                      <Settings className="w-5 h-5" />
                      <span>Settings</span>
                    </button>
                    <div className="border-t border-gray-200 dark:border-slate-700 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Log out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setShowNewChat(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-600 dark:text-gray-400"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-600 dark:text-gray-400">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-2 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={activeTab === 'group' ? 'Search groups...' : 'Search or start new chat'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-gray-100 dark:bg-slate-800 border-0 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
          {[
            { id: 'message', icon: MessageCircle, label: 'Chats' },
            { id: 'group', icon: Users, label: 'Groups' },
            { id: 'calls', icon: Phone, label: 'Calls' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as 'message' | 'group' | 'calls' | 'contacts')
                if (tab.id === 'calls') {
                  setCurrentView('calls')
                } else {
                  setCurrentView('chats')
                }
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-[#075e54] dark:text-teal-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#075e54]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              {activeTab === 'group' ? (
                <Users className="w-10 h-10 text-gray-300 dark:text-slate-600 mb-3" />
              ) : (
                <MessageCircle className="w-10 h-10 text-gray-300 dark:text-slate-600 mb-3" />
              )}
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {activeTab === 'group' 
                  ? (searchQuery ? 'No groups found' : 'No groups yet')
                  : (searchQuery ? 'No chats found' : 'No conversations yet')}
              </p>
              <Button
                onClick={() => setShowNewChat(true)}
                variant="link"
                className="text-[#075e54] mt-2 text-sm"
              >
                {activeTab === 'group' ? 'Create a group' : 'Start a new chat'}
              </Button>
            </div>
          ) : (
            <div>
              {filteredConversations.map((conv, index) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => handleSelectConversation(conv)}
                  className={`flex items-center gap-2.5 p-2.5 cursor-pointer list-item-press transition-colors ${
                    selectedConversation?.id === conv.id
                      ? 'bg-gray-100 dark:bg-slate-800'
                      : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-11 h-11">
                      <AvatarImage src={conv.avatar || conv.otherUser?.avatar || undefined} />
                      <AvatarFallback className="bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-sm">
                        {getInitials(conv.name || conv.otherUser?.name || '?')}
                      </AvatarFallback>
                    </Avatar>
                    {conv.type === 'private' && (
                      <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-slate-900 rounded-full ${
                        conv.otherUser?.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                          {conv.name || conv.otherUser?.name || 'Unknown'}
                        </h3>
                        {conv.type === 'private' && conv.otherUser?.isOnline && (
                          <span className="text-xs text-green-500 font-medium">online</span>
                        )}
                      </div>
                      {conv.lastMessage && (
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {formatTime(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {conv.lastMessage?.content || 'No messages yet'}
                      </p>
                      {conv.unreadCount && conv.unreadCount > 0 && (
                        <Badge className="bg-[#075e54] text-white text-xs min-w-[18px] h-4 flex items-center justify-center ml-2 px-1">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {renderMainContent()}
      </div>

      {/* New Chat Modal */}
      <NewChatModal open={showNewChat} onClose={() => setShowNewChat(false)} />
    </div>
  )
}

// User Icon
function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

// Settings View
function SettingsView({ onBack }: { onBack?: () => void }) {
  const { currentUser, logout } = useChatStore()
  const { theme, setTheme } = useTheme()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const handleLogout = async () => {
    if (currentUser) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      })
    }
    logout()
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      <header className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3 flex-shrink-0">
        <button onClick={onBack} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h1>
      </header>

      <div className="flex-1 overflow-y-auto min-h-0 p-4 max-w-2xl mx-auto w-full">
        <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3 mb-6">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-[#075e54] text-white">{currentUser ? getInitials(currentUser.name) : '?'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 dark:text-white truncate">{currentUser?.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{currentUser?.email}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
            <div className="w-9 h-9 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
              {theme === 'dark' ? <Sun className="w-4 h-4 text-teal-500" /> : <Moon className="w-4 h-4 text-teal-500" />}
            </div>
            <span className="text-gray-900 dark:text-white">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
            <div className="w-9 h-9 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <LogOut className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-red-500">Log Out</span>
          </button>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowLogoutConfirm(false)} />
          <motion.div className="relative bg-white dark:bg-slate-800 rounded-xl p-5 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Log Out?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Are you sure you want to log out?</p>
            <div className="flex gap-3">
              <Button onClick={() => setShowLogoutConfirm(false)} variant="outline" className="flex-1">Cancel</Button>
              <Button onClick={handleLogout} className="flex-1 bg-red-500 hover:bg-red-600">Log Out</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

// Profile View
function ProfileView({ onBack }: { onBack?: () => void }) {
  const { currentUser, setCurrentUser } = useChatStore()
  const [name, setName] = useState(currentUser?.name || '')
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (!currentUser) return
    try {
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      const data = await response.json()
      setCurrentUser({ ...currentUser, ...data.user })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Failed to save:', error)
    }
  }

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      <header className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3 flex-shrink-0">
        <button onClick={onBack} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Profile</h1>
      </header>

      <div className="flex-1 overflow-y-auto min-h-0 p-4 max-w-xl mx-auto w-full">
        <div className="flex flex-col items-center mb-6">
          <Avatar className="w-24 h-24 ring-4 ring-gray-100 dark:ring-slate-800">
            <AvatarFallback className="bg-[#075e54] text-white text-2xl">{currentUser ? getInitials(currentUser.name) : '?'}</AvatarFallback>
          </Avatar>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
            <label className="text-sm text-gray-500 dark:text-gray-400 mb-1.5 block">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-white dark:bg-slate-700" />
          </div>

          <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
            <label className="text-sm text-gray-500 dark:text-gray-400 mb-1.5 block">Email</label>
            <Input value={currentUser?.email || ''} disabled className="bg-gray-100 dark:bg-slate-600" />
          </div>

          <Button onClick={handleSave} className="w-full bg-[#075e54] hover:bg-[#064e47]">
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Contacts View
function ContactsView({ onBack }: { onBack?: () => void }) {
  const { currentUser, setSelectedConversation, setCurrentView } = useChatStore()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) return
    fetch(`/api/users?excludeUserId=${currentUser.id}`)
      .then(res => res.json())
      .then(data => setUsers(data.users || []))
      .finally(() => setLoading(false))
  }, [currentUser])

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const handleStartChat = async (userId: string) => {
    if (!currentUser) return
    const response = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'private', participantIds: [userId], creatorId: currentUser.id })
    })
    const data = await response.json()
    setSelectedConversation(data.conversation)
    setCurrentView('conversation')
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      <header className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3 flex-shrink-0">
        <button onClick={onBack} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Contacts</h1>
      </header>

      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>
        ) : (
          users.map(user => (
            <div key={user.id} onClick={() => handleStartChat(user.id)} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gray-200 dark:bg-slate-700">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">{user.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.isOnline ? 'Online' : 'Offline'}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// New Chat Modal
function NewChatModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { currentUser, setSelectedConversation, addConversation } = useChatStore()
  const [users, setUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isGroup, setIsGroup] = useState(false)
  const [groupName, setGroupName] = useState('')

  useEffect(() => {
    if (open && currentUser) {
      setLoading(true)
      fetch(`/api/users?excludeUserId=${currentUser.id}`)
        .then(res => res.json())
        .then(data => setUsers(data.users || []))
        .finally(() => setLoading(false))
    }
  }, [open, currentUser])

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateChat = async () => {
    if (!currentUser || selectedUsers.length === 0) return
    setCreating(true)
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: isGroup ? 'group' : 'private',
          participantIds: selectedUsers,
          name: isGroup ? groupName : undefined,
          creatorId: currentUser.id
        })
      })
      const data = await response.json()
      if (!data.existed) addConversation(data.conversation)
      setSelectedConversation(data.conversation)
      onClose()
    } catch (error) {
      console.error('Failed:', error)
    } finally {
      setCreating(false)
    }
  }

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-h-[85vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New Chat</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="w-5 h-5" /></button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-gray-100 dark:bg-slate-700 border-0" />
          </div>
          {selectedUsers.length > 0 && (
            <div className="mt-3 space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <input type="checkbox" checked={isGroup} onChange={(e) => setIsGroup(e.target.checked)} className="rounded border-gray-300 dark:border-slate-600 text-[#075e54]" />
                Create as group
              </label>
              {isGroup && <Input placeholder="Group name..." value={groupName} onChange={(e) => setGroupName(e.target.value)} className="bg-gray-100 dark:bg-slate-700 border-0" />}
              <div className="flex flex-wrap gap-1.5">
                {selectedUsers.map(userId => {
                  const user = users.find(u => u.id === userId)
                  return <Badge key={userId} variant="secondary" className="cursor-pointer bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs" onClick={() => setSelectedUsers(prev => prev.filter(id => id !== userId))}>{user?.name} ×</Badge>
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full" /></div>
          ) : (
            filteredUsers.map(user => (
              <div key={user.id} onClick={() => setSelectedUsers(prev => prev.includes(user.id) ? prev.filter(id => id !== user.id) : [...prev, user.id])} className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${selectedUsers.includes(user.id) ? 'bg-teal-50 dark:bg-teal-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700'}`}>
                <Avatar className="w-9 h-9"><AvatarFallback className="bg-gray-200 dark:bg-slate-700 text-sm">{getInitials(user.name)}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">{user.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedUsers.includes(user.id) ? 'bg-[#075e54] border-[#075e54]' : 'border-gray-300 dark:border-slate-600'}`}>
                  {selectedUsers.includes(user.id) && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
            ))
          )}
        </div>

        {selectedUsers.length > 0 && (
          <div className="p-3 border-t border-gray-200 dark:border-slate-700 flex-shrink-0">
            <Button onClick={handleCreateChat} disabled={creating || (isGroup && !groupName)} className="w-full bg-[#075e54] hover:bg-[#064e47]">
              {creating ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : `Start ${isGroup ? 'Group' : 'Chat'}`}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ==========================================
// CALLS VIEW (Desktop)
// ==========================================
function CallsView({ onBack }: { onBack?: () => void }) {
  const { currentUser, conversations, setSelectedConversation, setCurrentView } = useChatStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Generate mock calls from conversations using useMemo
  const calls = useMemo(() => {
    return conversations.slice(0, 10).map((conv, i) => ({
      id: `call-${i}`,
      conversationId: conv.id,
      name: conv.name || conv.otherUser?.name || 'Unknown',
      avatar: conv.avatar || conv.otherUser?.avatar,
      userId: conv.otherUser?.id,
      type: i % 3 === 0 ? 'incoming' : i % 3 === 1 ? 'outgoing' : 'missed',
      callType: i % 4 === 0 ? 'video' : 'audio',
      duration: i % 3 === 2 ? 0 : Math.floor(Math.random() * 600) + 30,
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 7)
    }))
  }, [conversations])

  const filteredCalls = calls.filter(call =>
    call.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatTime = (date: Date) => {
    const d = new Date(date)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
    
    if (diffDays === 0) return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    if (diffDays === 1) return `Yesterday, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    if (diffDays < 7) return `${d.toLocaleDateString([], { weekday: 'long' })}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const handleStartChat = async (call: any) => {
    if (!currentUser || !call.userId) return
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'private',
          participantIds: [call.userId],
          creatorId: currentUser.id
        })
      })
      const data = await response.json()
      setSelectedConversation(data.conversation)
      setCurrentView('conversation')
    } catch (error) {
      console.error('Failed to start chat:', error)
    }
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Header */}
      <header className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          {isMobile && (
            <button onClick={onBack} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Calls</h1>
        </div>
        
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search calls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-gray-100 dark:bg-slate-800 border-0 h-9"
          />
        </div>
      </header>

      {/* Calls List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-2xl mx-auto py-2">
          {/* New Call Button */}
          <div className="px-4 py-2">
            <div className="flex items-center gap-3 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl cursor-pointer hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors">
              <div className="w-10 h-10 bg-[#075e54] rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white text-sm">Make a call</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Start a voice or video call</p>
              </div>
            </div>
          </div>

          {filteredCalls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <Phone className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No recent calls</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Your call history will appear here</p>
            </div>
          ) : (
            filteredCalls.map((call, index) => (
              <motion.div
                key={call.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="px-4 py-1"
              >
                <div 
                  onClick={() => handleStartChat(call)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
                >
                  <Avatar className="w-12 h-12 flex-shrink-0">
                    <AvatarImage src={call.avatar || undefined} />
                    <AvatarFallback className="bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
                      {getInitials(call.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{call.name}</h3>
                    <div className="flex items-center gap-1.5">
                      {call.type === 'incoming' ? (
                        <PhoneIncoming className="w-4 h-4 text-green-500" />
                      ) : call.type === 'missed' ? (
                        <PhoneMissed className="w-4 h-4 text-red-500" />
                      ) : (
                        <PhoneOutgoing className="w-4 h-4 text-[#075e54]" />
                      )}
                      <span className={`text-sm ${call.type === 'missed' ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                        {call.type === 'missed' ? 'Missed' : formatDuration(call.duration)}
                      </span>
                      {call.callType === 'video' && (
                        <Video className="w-4 h-4 text-gray-400 ml-1" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-gray-400">{formatTime(call.timestamp)}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        // Initiate call
                      }}
                      className="p-2 hover:bg-[#075e54]/10 dark:hover:bg-[#075e54]/20 rounded-full text-[#075e54] transition-colors"
                    >
                      {call.callType === 'video' ? <Video className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
