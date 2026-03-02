'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import EmojiPicker, { Theme, EmojiClickData } from 'emoji-picker-react'
import { 
  MessageCircle, Users, Phone, Settings, Search, Plus, 
  MoreVertical, LogOut, Moon, Sun, X, UserPlus,
  Camera, Mic, Send, Paperclip, Smile, Check, CheckCheck,
  ArrowLeft, Video, Loader2, PhoneIncoming, PhoneOutgoing, PhoneMissed, User,
  Ban, Star, Download, Trash2, AlertCircle, Image as ImageIcon
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useChatStore, Message } from '@/store/chat-store'
import { useSocket, useLastSeen, useUserStatus } from '@/hooks/useSocket'
import { useTheme } from 'next-themes'
import { format, isToday, isYesterday } from 'date-fns'

// Chat Header Component with live status updates
function ChatHeader({ 
  onBack, 
  otherName, 
  otherAvatar, 
  otherUserId,
  onSearch,
  showSearch 
}: { 
  onBack: () => void
  otherName: string
  otherAvatar?: string | null
  otherUserId?: string
  onSearch: () => void
  showSearch: boolean
}) {
  const { typingUsers, currentUser } = useChatStore()
  
  // Get live user status
  const { isOnline, lastSeen } = useUserStatus(otherUserId)
  const lastSeenText = useLastSeen(lastSeen)
  
  // Only show typing indicator if the OTHER person (not current user) is typing
  const isOtherUserTyping = typingUsers.some(
    u => u.userId === otherUserId && u.userId !== currentUser?.id
  )
  
  const [showMenu, setShowMenu] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
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
    <>
      <div className="bg-[#075e54] dark:bg-slate-800 flex-shrink-0 relative" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center px-2 py-2.5 gap-2">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="p-2 -ml-1 active:bg-white/20 rounded-full transition-colors text-white flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          {/* Avatar with online indicator */}
          <div className="relative flex-shrink-0">
            <Avatar className="w-10 h-10">
              <AvatarImage src={otherAvatar || undefined} />
              <AvatarFallback className="bg-gray-400 dark:bg-slate-600 text-white text-sm font-semibold">
                {getInitials(otherName)}
              </AvatarFallback>
            </Avatar>
            {/* Online indicator on avatar */}
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#075e54] dark:border-slate-800 ${
              isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
            }`} />
          </div>
          
          {/* Name and Status */}
          <div className="flex-1 min-w-0 ml-1">
            <h2 className="font-semibold text-white truncate text-base leading-tight">{otherName}</h2>
            <div className="text-xs mt-0.5">
              {isOtherUserTyping ? (
                <span className="text-green-300 font-medium">typing...</span>
              ) : isOnline ? (
                <span className="text-green-300 font-medium">online</span>
              ) : (
                <span className="text-white/70">last seen {lastSeenText}</span>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button className="p-2 active:bg-white/20 rounded-full transition-colors text-white">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2 active:bg-white/20 rounded-full transition-colors text-white">
              <Phone className="w-5 h-5" />
            </button>
            <button 
              onClick={onSearch}
              className="p-2 active:bg-white/20 rounded-full transition-colors text-white"
            >
              <Search className="w-5 h-5" />
            </button>
            <button 
              className="p-2 active:bg-white/20 rounded-full transition-colors text-white"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full right-2 mt-1 bg-slate-700 dark:bg-slate-700 rounded-xl shadow-xl overflow-hidden z-[100] min-w-[180px]"
            >
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors ${
                    item.danger ? 'text-red-400' : 'text-white'
                  }`}
                  onClick={() => {
                    setShowMenu(false)
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
      </div>

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
                    ].map((theme) => (
                      <button
                        key={theme.name}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-all"
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.gradient}`} />
                        <span className="text-xs text-gray-400">{theme.name}</span>
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
    </>
  )
}

export function MobileLayout() {
  const {
    currentUser,
    conversations,
    setConversations,
    selectedConversation,
    setSelectedConversation,
    activeTab,
    setActiveTab,
    currentView,
    setCurrentView,
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
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  
  const userMenuRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  
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
  
  // Keep user online when tab is visible
  useEffect(() => {
    if (!currentUser) return

    const updateOnlineStatus = async (isOnline: boolean) => {
      try {
        if (isOnline) {
          await fetch('/api/auth/heartbeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id })
          })
        } else {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id })
          })
        }
      } catch (error) {
        console.error('Status update error:', error)
      }
    }

    // Set online on mount
    updateOnlineStatus(true)

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateOnlineStatus(true)
      }
    }

    // Handle before unload - set offline
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable delivery on page close
      const data = JSON.stringify({ userId: currentUser.id })
      navigator.sendBeacon('/api/auth/logout', data)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [currentUser])

  // Fetch conversations
  useEffect(() => {
    if (!currentUser) return
    fetch(`/api/conversations?userId=${currentUser.id}`)
      .then(res => res.json())
      .then(data => setConversations(data.conversations || []))
      .catch(err => console.error('Failed to fetch conversations:', err))
  }, [currentUser, setConversations])

  // Fetch messages when conversation selected
  useEffect(() => {
    if (!selectedConversation) return
    setLoadingMessages(true)
    fetch(`/api/messages?conversationId=${selectedConversation.id}&limit=50`)
      .then(res => res.json())
      .then(data => setMessages(data.messages || []))
      .catch(err => console.error('Failed to fetch messages:', err))
      .finally(() => setLoadingMessages(false))
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
  }

  const handleBack = () => {
    setSelectedConversation(null)
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

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = !searchQuery || 
      conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === 'group' ? conv.type === 'group' : conv.type === 'private' || activeTab === 'message'
    return matchesSearch && matchesTab
  })

  // Format last seen time with more detail
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

  // ==========================================
  // CONVERSATION VIEW (Chat Screen)
  // ==========================================
  if (selectedConversation) {
    const otherName = selectedConversation.name || selectedConversation.otherUser?.name || 'Unknown'
    const otherAvatar = selectedConversation.avatar || selectedConversation.otherUser?.avatar
    const otherUserId = selectedConversation.otherUser?.id

    return (
      <div className="fixed inset-0 flex flex-col bg-[#ece5dd] dark:bg-slate-900">
        {/* ========== CHAT HEADER ========== */}
        <ChatHeader
          onBack={handleBack}
          otherName={otherName}
          otherAvatar={otherAvatar}
          otherUserId={otherUserId}
          onSearch={() => setShowSearch(!showSearch)}
          showSearch={showSearch}
        />
        
        {/* Search Bar */}
        {showSearch && (
          <div className="bg-[#075e54] dark:bg-slate-800 px-3 pb-2">
            <Input
              placeholder="Search messages..."
              className="bg-white dark:bg-slate-700 border-0 h-9 rounded-lg"
              autoFocus
            />
          </div>
        )}

        {/* ========== MESSAGES AREA ========== */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {loadingMessages ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#075e54]" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-md">
                <Send className="w-10 h-10 text-[#075e54]" />
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">No messages yet</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Say hello to start the conversation 👋</p>
            </div>
          ) : (
            <div className="space-y-1">
              {groupedMessages.map((group) => (
                <div key={group.date}>
                  {/* Date Separator */}
                  <div className="flex items-center justify-center my-4">
                    <span className="px-3 py-1.5 bg-white/90 dark:bg-slate-700/90 rounded-lg text-xs text-gray-600 dark:text-gray-300 shadow-sm font-medium">
                      {group.date}
                    </span>
                  </div>
                  
                  {/* Messages */}
                  <div className="space-y-1">
                    {group.messages.map((message) => {
                      const isOwn = message.senderId === currentUser?.id
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] px-3 py-2 ${
                              isOwn
                                ? 'bg-[#dcf8c6] dark:bg-teal-600 text-gray-900 dark:text-white rounded-lg rounded-tr-sm'
                                : 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg rounded-tl-sm shadow-sm'
                            }`}
                          >
                            {!isOwn && selectedConversation.type === 'group' && (
                              <p className="text-xs text-teal-600 dark:text-teal-300 font-semibold mb-1">
                                {message.senderName}
                              </p>
                            )}
                            
                            <p className="text-[15px] break-words leading-relaxed">{message.content}</p>
                            
                            <div className={`flex items-center justify-end gap-1 mt-1 ${
                              isOwn ? 'text-gray-500 dark:text-gray-200' : 'text-gray-400'
                            }`}>
                              <span className="text-[11px]">
                                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isOwn && (
                                message.status === 'read' ? (
                                  <CheckCheck className="w-4 h-4 text-blue-500" />
                                ) : message.status === 'delivered' ? (
                                  <CheckCheck className="w-4 h-4" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="flex justify-start mt-2">
              <div className="bg-white dark:bg-slate-700 px-4 py-2.5 rounded-lg rounded-tl-sm shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* ========== INPUT AREA ========== */}
        <div className="bg-[#f0f0f0] dark:bg-slate-800 flex-shrink-0 relative" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {/* Emoji Picker */}
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
                ref={emojiPickerRef}
              >
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT}
                  width="100%"
                  height={350}
                  searchDisabled
                  skinTonesDisabled
                  previewConfig={{ showPreview: false }}
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex items-center px-2 py-2 gap-2">
            {/* Emoji Button */}
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-2 transition-colors flex-shrink-0 ${showEmojiPicker ? 'text-[#075e54]' : 'text-gray-500 active:text-[#075e54]'}`}
            >
              <Smile className="w-6 h-6" />
            </button>
            
            {/* Input Container */}
            <div className="flex-1 min-w-0 bg-white dark:bg-slate-700 rounded-full px-4 py-2 flex items-center">
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
                placeholder="Message"
                className="flex-1 bg-transparent border-0 focus-visible:ring-0 text-[15px] px-0"
              />
              <button className="p-1 text-gray-400 active:text-[#075e54] transition-colors flex-shrink-0 ml-1">
                <Paperclip className="w-5 h-5" />
              </button>
            </div>
            
            {/* Send/Mic Button */}
            {messageInput.trim() ? (
              <button
                onClick={handleSend}
                disabled={sending}
                className="p-2.5 bg-[#075e54] active:bg-[#054d47] rounded-full text-white transition-colors flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            ) : (
              <button className="p-2.5 text-[#075e54] transition-colors flex-shrink-0">
                <Mic className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ==========================================
  // CONTACTS VIEW (Mobile)
  // ==========================================
  if (currentView === 'contacts') {
    return (
      <div className="fixed inset-0 flex flex-col bg-white dark:bg-slate-900">
        {/* Header */}
        <div className="bg-[#075e54] dark:bg-slate-800 flex-shrink-0" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="flex items-center px-4 py-3 gap-3">
            <button
              onClick={() => setCurrentView('chats')}
              className="p-2 -ml-1 active:bg-white/20 rounded-full transition-colors text-white flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-white flex-1">Contacts</h1>
          </div>
          
          {/* Search Bar */}
          <div className="px-3 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-white dark:bg-slate-700 border-0 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          <MobileContactsList 
            searchQuery={searchQuery} 
            onSelectChat={(conv) => {
              setSelectedConversation(conv)
            }}
          />
        </div>
      </div>
    )
  }

  // ==========================================
  // PROFILE VIEW (Mobile)
  // ==========================================
  if (currentView === 'profile') {
    return (
      <div className="fixed inset-0 flex flex-col bg-white dark:bg-slate-900">
        {/* Header */}
        <div className="bg-[#075e54] dark:bg-slate-800 flex-shrink-0" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="flex items-center px-4 py-3 gap-3">
            <button
              onClick={() => setCurrentView('chats')}
              className="p-2 -ml-1 active:bg-white/20 rounded-full transition-colors text-white flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-white flex-1">Profile</h1>
          </div>
        </div>

        {/* Profile Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <MobileProfileView />
        </div>
      </div>
    )
  }

  // ==========================================
  // SETTINGS VIEW (Mobile)
  // ==========================================
  if (currentView === 'settings') {
    return (
      <div className="fixed inset-0 flex flex-col bg-white dark:bg-slate-900">
        {/* Header */}
        <div className="bg-[#075e54] dark:bg-slate-800 flex-shrink-0" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="flex items-center px-4 py-3 gap-3">
            <button
              onClick={() => setCurrentView('chats')}
              className="p-2 -ml-1 active:bg-white/20 rounded-full transition-colors text-white flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-white flex-1">Settings</h1>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <MobileSettingsView />
        </div>
      </div>
    )
  }

  // ==========================================
  // CHAT LIST VIEW (Home Screen)
  // ==========================================
  return (
    <div className="fixed inset-0 flex flex-col bg-white dark:bg-slate-900">
      {/* ========== HEADER ========== */}
      <div className="bg-[#075e54] dark:bg-slate-800 flex-shrink-0" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-white">LoyalChat</h1>
          <div className="flex items-center gap-0.5">
            <button className="p-2 active:bg-white/20 rounded-full transition-colors text-white">
              <Camera className="w-5 h-5" />
            </button>
            <button className="p-2 active:bg-white/20 rounded-full transition-colors text-white">
              <Search className="w-5 h-5" />
            </button>
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 active:bg-white/20 rounded-full transition-colors text-white"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              {/* Dropdown Menu */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden z-50"
                  >
                    <div className="p-3 border-b border-gray-200 dark:border-slate-700">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{currentUser?.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{currentUser?.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setCurrentView('contacts')
                          setShowUserMenu(false)
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left active:bg-gray-100 dark:active:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <Users className="w-5 h-5" />
                        <span>Contacts</span>
                      </button>
                      <button
                        onClick={() => {
                          setCurrentView('profile')
                          setShowUserMenu(false)
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left active:bg-gray-100 dark:active:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <User className="w-5 h-5" />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          setCurrentView('settings')
                          setShowUserMenu(false)
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left active:bg-gray-100 dark:active:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <Settings className="w-5 h-5" />
                        <span>Settings</span>
                      </button>
                      <button
                        onClick={() => {
                          setTheme(theme === 'dark' ? 'light' : 'dark')
                          setShowUserMenu(false)
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left active:bg-gray-100 dark:active:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left active:bg-red-50 dark:active:bg-red-900/20 text-red-500 transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Log out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex">
          {[
            { id: 'message', icon: MessageCircle, label: 'Chats' },
            { id: 'group', icon: Users, label: 'Groups' },
            { id: 'calls', icon: Phone, label: 'Calls' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as 'message' | 'group' | 'calls' | 'contacts')
                setCurrentView('chats')
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id ? 'text-white' : 'text-white/60'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabMobile"
                  className="absolute bottom-0 left-4 right-4 h-0.5 bg-white rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ========== SEARCH BAR ========== */}
      <div className="px-3 py-2 bg-white dark:bg-slate-900 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder={activeTab === 'group' ? 'Search groups...' : activeTab === 'calls' ? 'Search calls...' : 'Search chats...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-gray-100 dark:bg-slate-800 border-0 rounded-full text-sm"
          />
        </div>
      </div>

      {/* ========== CONTENT AREA ========== */}
      <div className="flex-1 overflow-y-auto">
        {/* Calls Tab Content */}
        {activeTab === 'calls' ? (
          <MobileCallsList />
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-20 h-20 bg-[#075e54]/10 rounded-full flex items-center justify-center mb-4">
              {activeTab === 'group' ? <Users className="w-10 h-10 text-[#075e54]" /> : <MessageCircle className="w-10 h-10 text-[#075e54]" />}
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
              {activeTab === 'group' 
                ? (searchQuery ? 'No groups found' : 'No groups yet')
                : (searchQuery ? 'No chats found' : 'No conversations yet')}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">
              {activeTab === 'group'
                ? 'Create a group to chat with multiple people'
                : 'Tap the button below to start a new chat'}
            </p>
            <Button
              onClick={() => setShowNewChat(true)}
              className="bg-[#075e54] hover:bg-[#054d47] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Start a new chat
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
                className="flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-gray-100 dark:active:bg-slate-800 transition-colors border-b border-gray-100 dark:border-slate-800"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={conv.avatar || conv.otherUser?.avatar || undefined} />
                    <AvatarFallback className="bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-base font-medium">
                      {getInitials(conv.name || conv.otherUser?.name || '?')}
                    </AvatarFallback>
                  </Avatar>
                  {conv.type === 'private' && (
                    <div className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 border-2 border-white dark:border-slate-900 rounded-full ${
                      conv.otherUser?.isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate text-base">
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
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {conv.lastMessage?.content || 'No messages yet'}
                    </p>
                    {conv.unreadCount && conv.unreadCount > 0 && (
                      <Badge className="bg-[#075e54] text-white text-xs min-w-[22px] h-5 flex items-center justify-center ml-2 px-1.5 rounded-full">
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

      {/* ========== FAB ========== */}
      {activeTab !== 'calls' && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          onClick={() => setShowNewChat(true)}
          className="fixed bottom-6 right-4 w-14 h-14 bg-[#075e54] active:bg-[#054d47] rounded-full flex items-center justify-center text-white shadow-lg transition-all z-40"
          style={{ boxShadow: '0 4px 12px rgba(7, 94, 84, 0.4)' }}
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      )}

      {/* New Chat Modal */}
      <NewChatModal open={showNewChat} onClose={() => setShowNewChat(false)} />
    </div>
  )
}

// ==========================================
// NEW CHAT MODAL
// ==========================================
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

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
      
      if (!data.existed) {
        addConversation(data.conversation)
      }
      
      setSelectedConversation(data.conversation)
      onClose()
    } catch (error) {
      console.error('Failed to create conversation:', error)
    } finally {
      setCreating(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="relative w-full bg-white dark:bg-slate-800 rounded-t-3xl shadow-xl max-h-[85vh] flex flex-col"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              New Chat
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 active:bg-gray-100 dark:active:bg-slate-700 rounded-full text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-gray-100 dark:bg-slate-700 border-0 h-10 rounded-full"
            />
          </div>
          
          {selectedUsers.length > 0 && (
            <div className="mt-3 space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={isGroup}
                  onChange={(e) => setIsGroup(e.target.checked)}
                  className="rounded border-gray-300 dark:border-slate-600 text-[#075e54] w-4 h-4"
                />
                Create as group
              </label>
              
              {isGroup && (
                <Input
                  placeholder="Group name..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="bg-gray-100 dark:bg-slate-700 border-0"
                />
              )}
              
              <div className="flex flex-wrap gap-1.5">
                {selectedUsers.map(userId => {
                  const user = users.find(u => u.id === userId)
                  return (
                    <Badge
                      key={userId}
                      className="cursor-pointer bg-[#075e54]/10 text-[#075e54] dark:text-teal-300 text-xs px-2 py-1"
                      onClick={() => setSelectedUsers(prev => prev.filter(id => id !== userId))}
                    >
                      {user?.name} ×
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-[#075e54] border-t-transparent rounded-full" />
            </div>
          ) : (
            filteredUsers.map(user => (
              <div
                key={user.id}
                onClick={() => {
                  setSelectedUsers(prev =>
                    prev.includes(user.id)
                      ? prev.filter(id => id !== user.id)
                      : [...prev, user.id]
                  )
                }}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  selectedUsers.includes(user.id)
                    ? 'bg-[#075e54]/10 dark:bg-[#075e54]/20'
                    : 'active:bg-gray-50 dark:active:bg-slate-700'
                }`}
              >
                <Avatar className="w-12 h-12 flex-shrink-0">
                  <AvatarFallback className="bg-gray-200 dark:bg-slate-700 text-sm font-medium">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">{user.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  selectedUsers.includes(user.id)
                    ? 'bg-[#075e54] border-[#075e54]'
                    : 'border-gray-300 dark:border-slate-600'
                }`}>
                  {selectedUsers.includes(user.id) && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {selectedUsers.length > 0 && (
          <div className="p-3 border-t border-gray-200 dark:border-slate-700 flex-shrink-0">
            <Button
              onClick={handleCreateChat}
              disabled={creating || (isGroup && !groupName)}
              className="w-full bg-[#075e54] hover:bg-[#054d47] h-12 text-base"
            >
              {creating ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                `Start ${isGroup ? 'Group' : 'Chat'}`
              )}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ==========================================
// MOBILE CONTACTS LIST COMPONENT
// ==========================================
function MobileContactsList({ 
  searchQuery, 
  onSelectChat 
}: { 
  searchQuery: string
  onSelectChat: (conv: any) => void 
}) {
  const { currentUser } = useChatStore()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!currentUser) return
    
    let isMounted = true
    
    const fetchUsers = async () => {
      try {
        const response = await fetch(`/api/users?excludeUserId=${currentUser.id}`)
        const data = await response.json()
        if (isMounted) {
          setUsers(data.users || [])
        }
      } catch (error) {
        console.error('Failed to fetch users:', error)
      }
    }
    
    fetchUsers()
    
    return () => {
      isMounted = false
    }
  }, [currentUser])

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const onlineUsers = filteredUsers.filter(u => u.isOnline)
  const offlineUsers = filteredUsers.filter(u => !u.isOnline)

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const handleStartChat = async (userId: string) => {
    if (!currentUser) return
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'private',
          participantIds: [userId],
          creatorId: currentUser.id
        })
      })
      const data = await response.json()
      onSelectChat(data.conversation)
    } catch (error) {
      console.error('Failed to start chat:', error)
    }
  }

  const formatLastSeen = (date: Date | string | null | undefined) => {
    if (!date) return 'offline'
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#075e54]" />
      </div>
    )
  }

  return (
    <div className="py-2">
      {/* Invite Friend */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-3 p-3 bg-[#075e54]/10 dark:bg-[#075e54]/20 rounded-xl">
          <div className="w-10 h-10 bg-[#075e54] rounded-full flex items-center justify-center flex-shrink-0">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm">Invite Friends</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Share LoyalChat with friends</p>
          </div>
        </div>
      </div>

      {/* Online Users */}
      {onlineUsers.length > 0 && (
        <div className="px-4 py-2">
          <span className="text-xs font-semibold text-[#075e54] dark:text-teal-400 uppercase tracking-wide">
            Online — {onlineUsers.length}
          </span>
        </div>
      )}

      {onlineUsers.map((user, index) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
          onClick={() => handleStartChat(user.id)}
          className="flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-gray-100 dark:active:bg-slate-800 transition-colors"
        >
          <div className="relative flex-shrink-0">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="bg-[#075e54]/20 dark:bg-[#075e54]/30 text-[#075e54] dark:text-teal-300">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
            <p className="text-xs text-green-500 font-medium">Online</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button className="p-2 active:bg-[#075e54]/20 rounded-full text-[#075e54]">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 active:bg-[#075e54]/20 rounded-full text-[#075e54]">
              <Video className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      ))}

      {/* Offline Users */}
      {offlineUsers.length > 0 && (
        <div className="px-4 py-2 mt-2">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Offline — {offlineUsers.length}
          </span>
        </div>
      )}

      {offlineUsers.map((user, index) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: (index + onlineUsers.length) * 0.03 }}
          onClick={() => handleStartChat(user.id)}
          className="flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-gray-100 dark:active:bg-slate-800 transition-colors"
        >
          <Avatar className="w-12 h-12 flex-shrink-0">
            <AvatarImage src={user.avatar || undefined} />
            <AvatarFallback className="bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{formatLastSeen(user.lastSeen)}</p>
          </div>
          <button className="p-2 active:bg-[#075e54]/20 rounded-full text-gray-400 flex-shrink-0">
            <MessageCircle className="w-5 h-5" />
          </button>
        </motion.div>
      ))}

      {filteredUsers.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No contacts found</p>
        </div>
      )}
    </div>
  )
}

// ==========================================
// MOBILE CALLS LIST COMPONENT
// ==========================================
function MobileCallsList() {
  const { currentUser, conversations, setSelectedConversation } = useChatStore()

  // Generate mock calls from conversations using useMemo
  const calls = useMemo(() => {
    return conversations.slice(0, 5).map((conv, i) => ({
      id: `call-${i}`,
      conversationId: conv.id,
      name: conv.name || conv.otherUser?.name || 'Unknown',
      avatar: conv.avatar || conv.otherUser?.avatar,
      type: i % 2 === 0 ? 'incoming' : 'outgoing',
      callType: i % 3 === 0 ? 'video' : 'audio',
      duration: i % 4 === 0 ? 0 : Math.floor(Math.random() * 600) + 30,
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 7)
    }))
  }, [conversations])

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
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <div className="py-2">
      {/* New Call Button */}
      <div className="px-4 py-2">
        <button className="flex items-center gap-3 p-3 bg-[#075e54]/10 dark:bg-[#075e54]/20 rounded-xl w-full">
          <div className="w-10 h-10 bg-[#075e54] rounded-full flex items-center justify-center flex-shrink-0">
            <Phone className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm">Make a call</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Start a voice or video call</p>
          </div>
        </button>
      </div>

      {/* Calls List */}
      {calls.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
          <Phone className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No recent calls</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Your call history will appear here</p>
        </div>
      ) : (
        calls.map((call, index) => (
          <motion.div
            key={call.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className="flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-gray-100 dark:active:bg-slate-800 transition-colors"
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
                  <PhoneIncoming className={`w-3.5 h-3.5 ${call.duration === 0 ? 'text-red-500' : 'text-green-500'}`} />
                ) : (
                  <PhoneOutgoing className={`w-3.5 h-3.5 ${call.duration === 0 ? 'text-red-500' : 'text-[#075e54]'}`} />
                )}
                <span className={`text-xs ${call.duration === 0 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                  {call.duration === 0 ? 'Missed' : formatDuration(call.duration)}
                </span>
                {call.callType === 'video' && (
                  <Video className="w-3.5 h-3.5 text-gray-400 ml-1" />
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-gray-400">{formatTime(call.timestamp)}</span>
              <button className="p-2 active:bg-[#075e54]/20 rounded-full text-[#075e54]">
                {call.callType === 'video' ? <Video className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
              </button>
            </div>
          </motion.div>
        ))
      )}
    </div>
  )
}

// ==========================================
// MOBILE PROFILE VIEW COMPONENT
// ==========================================
function MobileProfileView() {
  const { currentUser, setCurrentUser, setCurrentView, setSelectedConversation } = useChatStore()
  const [name, setName] = useState(currentUser?.name || '')
  const [saved, setSaved] = useState(false)

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

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

  return (
    <div className="space-y-4">
      {/* Avatar Section */}
      <div className="flex flex-col items-center py-6">
        <Avatar className="w-24 h-24 ring-4 ring-[#075e54]/20 dark:ring-teal-500/20">
          <AvatarImage src={currentUser?.avatar || undefined} />
          <AvatarFallback className="bg-[#075e54] text-white text-2xl font-bold">
            {currentUser ? getInitials(currentUser.name) : '?'}
          </AvatarFallback>
        </Avatar>
        <button className="mt-3 text-sm text-[#075e54] dark:text-teal-400 font-medium">
          Change photo
        </button>
      </div>

      {/* Profile Info */}
      <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1.5 block">Name</label>
        <Input 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          className="bg-white dark:bg-slate-700 border-0"
        />
      </div>

      <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1.5 block">Email</label>
        <Input 
          value={currentUser?.email || ''} 
          disabled 
          className="bg-gray-100 dark:bg-slate-600 text-gray-500 dark:text-gray-400"
        />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Email cannot be changed</p>
      </div>

      <Button 
        onClick={handleSave} 
        className="w-full bg-[#075e54] hover:bg-[#054d47] h-12 text-base"
      >
        {saved ? (
          <span className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            Saved!
          </span>
        ) : 'Save Changes'}
      </Button>
    </div>
  )
}

// ==========================================
// MOBILE SETTINGS VIEW COMPONENT
// ==========================================
function MobileSettingsView() {
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
    <div className="space-y-4">
      {/* Account Info */}
      <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={currentUser?.avatar || undefined} />
            <AvatarFallback className="bg-[#075e54] text-white">{currentUser ? getInitials(currentUser.name) : '?'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900 dark:text-white truncate">{currentUser?.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{currentUser?.email}</p>
          </div>
        </div>
      </div>

      {/* Settings Options */}
      <div className="space-y-2">
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
          className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl active:bg-gray-100 dark:active:bg-slate-700 transition-colors"
        >
          <div className="w-10 h-10 bg-[#075e54]/10 dark:bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            {theme === 'dark' ? <Sun className="w-5 h-5 text-[#075e54] dark:text-teal-400" /> : <Moon className="w-5 h-5 text-[#075e54] dark:text-teal-400" />}
          </div>
          <div className="flex-1 text-left">
            <span className="text-gray-900 dark:text-white font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">Toggle app appearance</p>
          </div>
        </button>

        <button 
          onClick={() => setShowLogoutConfirm(true)} 
          className="w-full flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl active:bg-red-100 dark:active:bg-red-900/30 transition-colors"
        >
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
            <LogOut className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1 text-left">
            <span className="text-red-500 font-medium">Log Out</span>
            <p className="text-xs text-red-400">Sign out of your account</p>
          </div>
        </button>
      </div>

      {/* App Info */}
      <div className="text-center pt-4">
        <p className="text-xs text-gray-400 dark:text-gray-500">LoyalChat v1.0.0</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Made with ❤️</p>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowLogoutConfirm(false)} />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white dark:bg-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-xl"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Log Out?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Are you sure you want to log out of LoyalChat?</p>
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowLogoutConfirm(false)} 
                variant="outline" 
                className="flex-1 h-11"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleLogout} 
                className="flex-1 bg-red-500 hover:bg-red-600 h-11"
              >
                Log Out
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
