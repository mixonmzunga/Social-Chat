'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Plus, MessageCircle, Users, Phone, 
  Settings, User, Loader2, Check, CheckCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChatStore, Conversation } from '@/store/chat-store'
import { formatDistanceToNow } from 'date-fns'

export function ChatHomeScreen() {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    setSelectedConversation,
    conversations,
    setConversations,
    conversationsLoading,
    currentView,
    setCurrentView
  } = useChatStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [showNewChat, setShowNewChat] = useState(false)

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUser) return
      
      try {
        const response = await fetch(`/api/conversations?userId=${currentUser.id}`)
        const data = await response.json()
        setConversations(data.conversations || [])
      } catch (error) {
        console.error('Failed to fetch conversations:', error)
      }
    }

    fetchConversations()
  }, [currentUser, setConversations])

  // Filter conversations by tab and search
  const filteredConversations = conversations.filter(conv => {
    const matchesTab = activeTab === 'message' 
      ? conv.type === 'private'
      : activeTab === 'group' 
        ? conv.type === 'group'
        : true // calls tab - show all for now
    
    const matchesSearch = !searchQuery || 
      conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesTab && matchesSearch
  })

  const formatTime = (date: Date | string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    
    if (diff < 86400000) { // Less than 24 hours
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diff < 604800000) { // Less than a week
      return d.toLocaleDateString([], { weekday: 'short' })
    } else {
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-teal-500 text-white px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">All Chat</h1>
          <button className="p-2 hover:bg-teal-600 rounded-full transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-teal-600/30 rounded-xl p-1">
          {(['message', 'group', 'calls'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === tab
                  ? 'bg-white text-teal-600'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                {tab === 'message' && <MessageCircle className="w-4 h-4" />}
                {tab === 'group' && <Users className="w-4 h-4" />}
                {tab === 'calls' && <Phone className="w-4 h-4" />}
                <span className="capitalize">{tab}s</span>
              </span>
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {activeTab === 'group' && filteredConversations.length === 0 ? (
          // Empty state for groups
          <EmptyState
            type="group"
            onAction={() => setShowNewChat(true)}
          />
        ) : activeTab === 'calls' ? (
          // Calls tab
          <EmptyState
            type="calls"
          />
        ) : (
          // Chat list
          <ScrollArea className="flex-1">
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              <AnimatePresence>
                {conversationsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                    <MessageCircle className="w-16 h-16 text-gray-300 dark:text-slate-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {activeTab === 'message' 
                        ? 'No messages yet. Start a conversation!'
                        : 'No groups found'}
                    </p>
                    <Button
                      onClick={() => setShowNewChat(true)}
                      className="bg-teal-500 hover:bg-teal-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Chat
                    </Button>
                  </div>
                ) : (
                  filteredConversations.map((conv, index) => (
                    <motion.div
                      key={conv.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedConversation(conv)}
                      className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      {/* Avatar */}
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={conv.avatar || conv.otherUser?.avatar || undefined} />
                          <AvatarFallback className="bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-300">
                            {getInitials(conv.name || conv.otherUser?.name || '?')}
                          </AvatarFallback>
                        </Avatar>
                        {/* Online indicator */}
                        {(conv.otherUser?.isOnline || conv.type === 'group') && conv.otherUser?.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {conv.name || conv.otherUser?.name || 'Unknown'}
                          </h3>
                          {conv.lastMessage && (
                            <span className="text-xs text-gray-400">
                              {formatTime(conv.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {conv.lastMessage?.content || 'No messages yet'}
                          </p>
                          {conv.unreadCount && conv.unreadCount > 0 && (
                            <Badge className="bg-teal-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowNewChat(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-teal-500 rounded-full shadow-lg shadow-teal-500/30 flex items-center justify-center text-white"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Bottom Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 px-6 py-3 sticky bottom-0">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setCurrentView('contacts')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-teal-500 transition-colors"
          >
            <User className="w-6 h-6" />
            <span className="text-xs">Contacts</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 text-teal-500"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs font-medium">Chats</span>
          </button>
          <button
            onClick={() => setCurrentView('settings')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-teal-500 transition-colors"
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </nav>

      {/* New Chat Modal */}
      <NewChatModal
        open={showNewChat}
        onClose={() => setShowNewChat(false)}
      />
    </div>
  )
}

// Empty State Component
function EmptyState({ type, onAction }: { type: 'group' | 'calls'; onAction?: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-32 h-32 mb-6 relative">
        <div className="absolute inset-0 bg-teal-100 dark:bg-teal-900/30 rounded-full" />
        <div className="absolute inset-4 bg-teal-200 dark:bg-teal-800/50 rounded-full flex items-center justify-center">
          {type === 'group' ? (
            <Users className="w-12 h-12 text-teal-500" />
          ) : (
            <Phone className="w-12 h-12 text-teal-500" />
          )}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {type === 'group' ? 'No Group Chat Yet' : 'No Recent Calls'}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6 max-w-xs">
        {type === 'group' 
          ? 'Create a group to chat with multiple people at once'
          : 'Your recent calls will appear here'}
      </p>
      {onAction && (
        <Button
          onClick={onAction}
          className="bg-teal-500 hover:bg-teal-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          {type === 'group' ? 'Create Group' : 'New Call'}
        </Button>
      )}
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              New Chat
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-50 dark:bg-slate-700"
          />
          
          {selectedUsers.length > 0 && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isGroup}
                    onChange={(e) => setIsGroup(e.target.checked)}
                    className="rounded"
                  />
                  Create as group
                </label>
              </div>
              
              {isGroup && (
                <Input
                  placeholder="Group name..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="bg-gray-50 dark:bg-slate-700"
                />
              )}
              
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(userId => {
                  const user = users.find(u => u.id === userId)
                  return (
                    <Badge
                      key={userId}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => setSelectedUsers(prev => prev.filter(id => id !== userId))}
                    >
                      {user?.name} ✕
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Users List */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  onClick={() => {
                    setSelectedUsers(prev =>
                      prev.includes(user.id)
                        ? prev.filter(id => id !== user.id)
                        : [...prev, user.id]
                    )
                  }}
                  className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${
                    selectedUsers.includes(user.id)
                      ? 'bg-teal-50 dark:bg-teal-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback>
                      {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{user.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                  {selectedUsers.includes(user.id) && (
                    <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {selectedUsers.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-slate-700">
            <Button
              onClick={handleCreateChat}
              disabled={creating || (isGroup && !groupName)}
              className="w-full bg-teal-500 hover:bg-teal-600"
            >
              {creating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
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
