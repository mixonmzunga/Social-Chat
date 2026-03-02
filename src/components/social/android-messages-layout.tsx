'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Plus, Phone, MoreVertical,
  PhoneIncoming, PhoneOutgoing, PhoneMissed,
  Video, MessageCircle, Users, X, Check, CheckCheck
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useChatStore, Conversation } from '@/store/chat-store'
import { useUserStatus, useLastSeen } from '@/hooks/useSocket'
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'
import { cn } from '@/lib/utils'

type Tab = 'chats' | 'groups' | 'calls'

interface CallRecord {
  id: string
  name: string
  avatar: string | null
  type: 'incoming' | 'outgoing' | 'missed'
  callType: 'voice' | 'video'
  timestamp: Date
  duration?: string
}

const sampleCalls: CallRecord[] = [
  { id: '1', name: 'Sarah Johnson', avatar: null, type: 'incoming', callType: 'voice', timestamp: new Date(Date.now() - 3600000), duration: '5:23' },
  { id: '2', name: 'Mike Chen', avatar: null, type: 'outgoing', callType: 'video', timestamp: new Date(Date.now() - 7200000), duration: '12:45' },
  { id: '3', name: 'Emma Wilson', avatar: null, type: 'missed', callType: 'voice', timestamp: new Date(Date.now() - 86400000) },
  { id: '4', name: 'David Kim', avatar: null, type: 'incoming', callType: 'video', timestamp: new Date(Date.now() - 172800000), duration: '3:10' },
  { id: '5', name: 'Sophie Taylor', avatar: null, type: 'outgoing', callType: 'voice', timestamp: new Date(Date.now() - 259200000), duration: '8:55' },
]

export function AndroidMessagesLayout() {
  const {
    currentUser,
    conversations,
    setConversations,
    setSelectedConversation,
  } = useChatStore()

  const [activeTab, setActiveTab] = useState<Tab>('chats')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [calls] = useState<CallRecord[]>(sampleCalls)

  // Fetch conversations
  useEffect(() => {
    if (!currentUser) return
    fetch(`/api/conversations?userId=${currentUser.id}`)
      .then(res => res.json())
      .then(data => setConversations(data.conversations || []))
      .catch(err => console.error('Failed to fetch conversations:', err))
  }, [currentUser, setConversations])

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatTime = (date: Date | string) => {
    const d = new Date(date)
    if (isToday(d)) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (isYesterday(d)) {
      return 'Yesterday'
    } else {
      return format(d, 'MMM d')
    }
  }

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      const matchesSearch = !searchQuery || 
        conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesTab = activeTab === 'groups' ? conv.type === 'group' : conv.type === 'private'
      
      return matchesSearch && matchesTab
    })
  }, [conversations, searchQuery, activeTab])

  const formatLastSeen = (date: Date | string | null | undefined) => {
    if (!date) return 'offline'
    const d = new Date(date)
    return formatDistanceToNow(d, { addSuffix: true })
  }

  // Tab configuration
  const tabs: { id: Tab; label: string; icon: typeof MessageCircle }[] = [
    { id: 'chats', label: 'Chats', icon: MessageCircle },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'calls', label: 'Calls', icon: Phone },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
      {/* Header - Elegant Purple to Pink Gradient */}
      <header 
        className="sticky top-0 z-20 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 shadow-lg shadow-violet-500/20"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="text-white">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 py-3">
            {showSearch ? (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: '100%' }}
                className="flex items-center gap-2"
              >
                <button
                  onClick={() => {
                    setShowSearch(false)
                    setSearchQuery('')
                  }}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${activeTab}...`}
                    className="bg-white/20 backdrop-blur-sm border-0 text-white placeholder:text-white/60 h-10 rounded-xl pl-4 focus-visible:ring-white/30"
                    autoFocus
                  />
                </div>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  {/* Logo */}
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold tracking-tight">Social Chat</h1>
                    <p className="text-xs text-white/70">Stay connected</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowSearch(true)}
                    className="p-2.5 rounded-full hover:bg-white/10 transition-all active:scale-95"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                  <button className="p-2.5 rounded-full hover:bg-white/10 transition-all active:scale-95">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Animated Tabs */}
          {!showSearch && (
            <div className="px-4 pb-3">
              <div className="relative flex bg-white/10 backdrop-blur-sm rounded-2xl p-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  const count = tab.id === 'chats' 
                    ? conversations.filter(c => c.type === 'private').length
                    : tab.id === 'groups'
                    ? conversations.filter(c => c.type === 'group').length
                    : calls.length

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "relative flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                        isActive
                          ? "text-violet-700"
                          : "text-white/80 hover:text-white"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTabBg"
                          className="absolute inset-0 bg-white rounded-xl shadow-lg"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                        {!isActive && count > 0 && (
                          <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                            {count}
                          </span>
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'calls' ? (
            <motion.div
              key="calls"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="divide-y divide-gray-100 dark:divide-slate-800"
            >
              {calls.length === 0 ? (
                <EmptyState type="calls" getInitials={getInitials} />
              ) : (
                calls.map((call, index) => (
                  <CallItem
                    key={call.id}
                    call={call}
                    index={index}
                    getInitials={getInitials}
                    formatTime={formatTime}
                  />
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredConversations.length === 0 ? (
                <EmptyState 
                  type={activeTab} 
                  getInitials={getInitials}
                />
              ) : (
                <div className="divide-y divide-gray-50 dark:divide-slate-800">
                  {filteredConversations.map((conv, index) => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      index={index}
                      getInitials={getInitials}
                      formatTime={formatTime}
                      formatLastSeen={formatLastSeen}
                      onClick={() => setSelectedConversation(conv)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Elegant FAB */}
      <motion.button
        key={activeTab}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 180 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center text-white bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 shadow-violet-500/30 border-2 border-white/20"
      >
        {activeTab === 'calls' ? (
          <Phone className="w-6 h-6" />
        ) : activeTab === 'groups' ? (
          <Users className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </motion.button>
    </div>
  )
}

// Conversation Item Component
function ConversationItem({
  conversation,
  index,
  getInitials,
  formatTime,
  formatLastSeen,
  onClick
}: {
  conversation: Conversation
  index: number
  getInitials: (name: string) => string
  formatTime: (date: Date | string) => string
  formatLastSeen: (date: Date | string | null | undefined) => string
  onClick: () => void
}) {
  const name = conversation.name || conversation.otherUser?.name || 'Unknown'
  const avatar = conversation.avatar || conversation.otherUser?.avatar
  const isOnline = conversation.otherUser?.isOnline
  const lastSeen = conversation.otherUser?.lastSeen

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 30 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 active:bg-gray-100 dark:active:bg-slate-700/50 transition-colors"
    >
      {/* Avatar with Online Status */}
      <div className="relative flex-shrink-0">
        <Avatar className="w-14 h-14 ring-2 ring-gray-100 dark:ring-slate-700">
          <AvatarImage src={avatar || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-violet-500 to-pink-500 text-white font-semibold text-lg">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        {/* Online Indicator */}
        {isOnline && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-full h-full bg-green-400 rounded-full"
            />
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate text-base">
            {name}
          </h3>
          {conversation.lastMessage && (
            <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
              {formatTime(conversation.lastMessage.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {/* Message Status Indicator */}
            {conversation.lastMessage && (
              <span className="flex-shrink-0">
                {conversation.lastMessage.status === 'read' ? (
                  <CheckCheck className="w-4 h-4 text-violet-500" />
                ) : conversation.lastMessage.status === 'delivered' ? (
                  <CheckCheck className="w-4 h-4 text-gray-400" />
                ) : (
                  <Check className="w-4 h-4 text-gray-400" />
                )}
              </span>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {conversation.lastMessage?.content || (isOnline ? (
                <span className="text-green-500 font-medium">online</span>
              ) : formatLastSeen(lastSeen))}
            </p>
          </div>
          {/* Unread Badge */}
          {conversation.unreadCount && conversation.unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex-shrink-0 ml-2"
            >
              <Badge className="bg-gradient-to-r from-violet-500 to-pink-500 text-white text-xs min-w-[22px] h-5 flex items-center justify-center rounded-full px-1.5 font-semibold">
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </Badge>
            </motion.div>
          )}
        </div>
      </div>
    </motion.button>
  )
}

// Call Item Component
function CallItem({
  call,
  index,
  getInitials,
  formatTime
}: {
  call: CallRecord
  index: number
  getInitials: (name: string) => string
  formatTime: (date: Date | string) => string
}) {
  const getCallIcon = () => {
    switch (call.type) {
      case 'incoming':
        return <PhoneIncoming className="w-4 h-4 text-green-500" />
      case 'outgoing':
        return <PhoneOutgoing className="w-4 h-4 text-blue-500" />
      case 'missed':
        return <PhoneMissed className="w-4 h-4 text-red-500" />
    }
  }

  const getCallText = () => {
    switch (call.type) {
      case 'incoming':
        return `Incoming ${call.callType} call${call.duration ? ` · ${call.duration}` : ''}`
      case 'outgoing':
        return `Outgoing ${call.callType} call${call.duration ? ` · ${call.duration}` : ''}`
      case 'missed':
        return `Missed ${call.callType} call`
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 30 }}
      className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 active:bg-gray-100 dark:active:bg-slate-700/50 transition-colors cursor-pointer"
    >
      {/* Avatar */}
      <Avatar className="w-14 h-14 ring-2 ring-gray-100 dark:ring-slate-700">
        <AvatarImage src={call.avatar || undefined} />
        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-pink-500 text-white font-semibold text-lg">
          {getInitials(call.name)}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 dark:text-white truncate text-base mb-1">
          {call.name}
        </h3>
        <div className="flex items-center gap-2 text-sm">
          {getCallIcon()}
          <span className={cn(
            "truncate",
            call.type === 'missed' ? "text-red-500 font-medium" : "text-gray-500 dark:text-gray-400"
          )}>
            {getCallText()}
          </span>
        </div>
      </div>

      {/* Time & Actions */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {formatTime(call.timestamp)}
        </span>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={cn(
            "p-2.5 rounded-xl transition-colors",
            call.callType === 'video'
              ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-900/50"
              : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
          )}
        >
          {call.callType === 'video' ? (
            <Video className="w-5 h-5" />
          ) : (
            <Phone className="w-5 h-5" />
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}

// Empty State Component
function EmptyState({
  type,
  getInitials
}: {
  type: 'chats' | 'groups' | 'calls'
  getInitials: (name: string) => string
}) {
  const config = {
    chats: {
      icon: MessageCircle,
      title: 'No chats yet',
      subtitle: 'Start a conversation with your friends',
      gradient: 'from-violet-500 to-pink-500'
    },
    groups: {
      icon: Users,
      title: 'No groups yet',
      subtitle: 'Create a group to chat with multiple people',
      gradient: 'from-blue-500 to-cyan-500'
    },
    calls: {
      icon: Phone,
      title: 'No recent calls',
      subtitle: 'Your call history will appear here',
      gradient: 'from-green-500 to-emerald-500'
    }
  }

  const { icon: Icon, title, subtitle, gradient } = config[type]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 shadow-lg`}
      >
        <Icon className="w-12 h-12 text-white" />
      </motion.div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
        {subtitle}
      </p>
    </motion.div>
  )
}
