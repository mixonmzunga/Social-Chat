'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, Check, CheckCheck, MessageCircle, Users,
  Phone, Video, PhoneCall, PhoneIncoming, PhoneOutgoing,
  PhoneMissed, X, Loader2
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { useChatStore, Conversation } from '@/store/chat-store'
import { format, isToday, isYesterday } from 'date-fns'
import { cn } from '@/lib/utils'

type Tab = 'chats' | 'groups' | 'calls'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatTime(date: Date | string) {
  const d = new Date(date)
  if (isToday(d)) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d')
}

// ─── Static calls data ────────────────────────────────────────────────────────

const SAMPLE_CALLS = [
  { id: '1', name: 'Sarah Johnson', type: 'incoming' as const, callType: 'video' as const, time: '2h ago', duration: '5:23' },
  { id: '2', name: 'Mike Chen', type: 'outgoing' as const, callType: 'voice' as const, time: '4h ago', duration: '12:45' },
  { id: '3', name: 'Emma Wilson', type: 'missed' as const, callType: 'voice' as const, time: 'Yesterday', duration: undefined },
  { id: '4', name: 'Alex Rivera', type: 'incoming' as const, callType: 'voice' as const, time: 'Yesterday', duration: '3:10' },
  { id: '5', name: 'Jamie Park', type: 'outgoing' as const, callType: 'video' as const, time: 'Mon', duration: '8:02' },
]

// ─── New Chat Modal ───────────────────────────────────────────────────────────

function NewChatModal({ onClose, onStart }: {
  onClose: () => void
  onStart: (conv: Conversation) => void
}) {
  const { currentUser, addConversation } = useChatStore()
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState<string | null>(null)

  useEffect(() => {
    if (!currentUser) return
    fetch(`/api/users?excludeUserId=${currentUser.id}`)
      .then(r => r.json())
      .then(d => setUsers(d.users || []))
      .finally(() => setLoading(false))
  }, [currentUser])

  const filtered = useMemo(() =>
    users.filter(u =>
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    ), [users, search])

  const handleStart = async (userId: string) => {
    if (!currentUser || starting) return
    setStarting(userId)
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'private', participantIds: [userId], creatorId: currentUser.id }),
      })
      const data = await res.json()
      if (data.conversation) {
        const user = filtered.find(u => u.id === userId)
        const conv: Conversation = {
          id: data.conversation.id,
          type: 'private',
          name: user?.name,
          participants: [],
          otherUser: user,
          lastMessageAt: new Date(),
        }
        addConversation(conv)
        onStart(conv)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setStarting(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-slate-700 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">New Message</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search people..."
              className="pl-9 bg-gray-50 dark:bg-slate-800 border-0 h-9 text-sm"
            />
          </div>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-10">No users found</p>
          ) : filtered.map(user => (
            <button
              key={user.id}
              onClick={() => handleStart(user.id)}
              disabled={!!starting}
              className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="relative">
                <Avatar className="w-9 h-9">
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback className="bg-slate-700 text-white text-xs font-semibold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                {user.isOnline && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
              {starting === user.id && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Calls Tab ────────────────────────────────────────────────────────────────

function CallsTab() {
  return (
    <div>
      {SAMPLE_CALLS.map((call, i) => {
        const initials = getInitials(call.name)
        const isMissed = call.type === 'missed'
        return (
          <motion.div
            key={call.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors border-b border-gray-50 dark:border-slate-800/50"
          >
            {/* Avatar */}
            <Avatar className="w-11 h-11 shrink-0">
              <AvatarFallback className="bg-slate-700 text-white text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm font-medium truncate',
                isMissed ? 'text-red-500' : 'text-gray-900 dark:text-white'
              )}>
                {call.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {call.type === 'incoming' && <PhoneIncoming className="w-3.5 h-3.5 text-green-500" />}
                {call.type === 'outgoing' && <PhoneOutgoing className="w-3.5 h-3.5 text-gray-400" />}
                {call.type === 'missed' && <PhoneMissed className="w-3.5 h-3.5 text-red-500" />}
                <span className={cn('text-xs', isMissed ? 'text-red-400' : 'text-gray-400')}>
                  {call.type.charAt(0).toUpperCase() + call.type.slice(1)}
                  {call.duration && ` · ${call.duration}`}
                </span>
                <span className="text-gray-300 dark:text-slate-600">·</span>
                <span className="text-xs text-gray-400">{call.time}</span>
              </div>
            </div>

            {/* Call-back buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-gray-500 dark:text-gray-400">
                <Phone className="w-4 h-4" />
              </button>
              {call.callType === 'video' && (
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-gray-500 dark:text-gray-400">
                  <Video className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ type }: { type: Tab }) {
  const icons = { chats: MessageCircle, groups: Users, calls: PhoneCall }
  const Icon = icons[type]
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 px-6 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-300 dark:text-slate-600" />
      </div>
      <p className="text-base font-semibold text-gray-600 dark:text-gray-300">No {type} yet</p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 max-w-xs">
        {type === 'calls'
          ? 'Your call history will appear here'
          : 'Start a conversation with your friends'}
      </p>
    </motion.div>
  )
}

// ─── Main MessagesScreen ──────────────────────────────────────────────────────

export function MessagesScreen() {
  const { currentUser, conversations, setConversations, setSelectedConversation } = useChatStore()

  const [activeTab, setActiveTab] = useState<Tab>('chats')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewChat, setShowNewChat] = useState(false)

  useEffect(() => {
    if (!currentUser) return
    fetch(`/api/conversations?userId=${currentUser.id}`)
      .then(r => r.json())
      .then(d => setConversations(d.conversations || []))
      .catch(console.error)
  }, [currentUser, setConversations])

  const filtered = useMemo(() =>
    conversations.filter(c => {
      const matchSearch = !searchQuery ||
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchTab = activeTab === 'groups' ? c.type === 'group' : c.type === 'private'
      return matchSearch && matchTab
    }), [conversations, searchQuery, activeTab])

  const tabs: { id: Tab; label: string; icon: typeof MessageCircle }[] = [
    { id: 'chats', label: 'Chats', icon: MessageCircle },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'calls', label: 'Calls', icon: PhoneCall },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Messages</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {activeTab === 'calls' ? `${SAMPLE_CALLS.length} recent calls` : `${conversations.length} conversations`}
            </p>
          </div>
          <button
            onClick={() => setShowNewChat(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Message
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search conversations…"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 border border-gray-200 dark:border-slate-700 outline-none focus:border-gray-400 dark:focus:border-slate-500 transition-colors"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pb-0">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
                  isActive
                    ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'calls' ? (
            SAMPLE_CALLS.length > 0 ? <CallsTab /> : <EmptyState type="calls" />
          ) : filtered.length === 0 ? (
            <EmptyState type={activeTab} />
          ) : (
            filtered.map((conv, i) => {
              const name = conv.name || conv.otherUser?.name || 'Unknown'
              const avatar = conv.avatar ?? conv.otherUser?.avatar ?? null
              const isOnline = conv.otherUser?.isOnline

              return (
                <motion.button
                  key={conv.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedConversation(conv)}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors border-b border-gray-50 dark:border-slate-800/50 text-left"
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={avatar || undefined} />
                      <AvatarFallback className="bg-slate-700 text-white font-semibold">
                        {getInitials(name)}
                      </AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className={cn(
                        'text-sm truncate',
                        conv.unreadCount && conv.unreadCount > 0
                          ? 'font-semibold text-gray-900 dark:text-white'
                          : 'font-medium text-gray-800 dark:text-gray-200'
                      )}>
                        {name}
                      </h3>
                      {conv.lastMessage && (
                        <span className="text-[11px] text-gray-400 shrink-0 ml-3">
                          {formatTime(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        {conv.lastMessage && (
                          <span className="shrink-0">
                            {conv.lastMessage.status === 'read'
                              ? <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                              : conv.lastMessage.status === 'delivered'
                                ? <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
                                : <Check className="w-3.5 h-3.5 text-gray-400" />
                            }
                          </span>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                          {conv.lastMessage?.content || (isOnline ? 'Online' : 'Tap to start chatting')}
                        </p>
                      </div>
                      {conv.unreadCount && conv.unreadCount > 0 && (
                        <span className="ml-2 shrink-0 min-w-[20px] h-5 px-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] font-bold rounded-full flex items-center justify-center">
                          {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              )
            })
          )}
        </motion.div>
      </AnimatePresence>

      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChat && (
          <NewChatModal
            onClose={() => setShowNewChat(false)}
            onStart={conv => {
              setSelectedConversation(conv)
              setShowNewChat(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
