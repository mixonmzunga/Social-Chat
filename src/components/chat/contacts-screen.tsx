'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, UserPlus, Phone, Video, MessageCircle, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useChatStore } from '@/store/chat-store'

interface ContactsScreenProps {
  onBack?: () => void
}

export function ContactsScreen({ onBack }: ContactsScreenProps) {
  const { currentUser, setCurrentView, setSelectedConversation } = useChatStore()
  const [users, setUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  // Detect mobile
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser) return
      
      try {
        const response = await fetch(`/api/users?excludeUserId=${currentUser.id}`)
        const data = await response.json()
        setUsers(data.users || [])
      } catch (error) {
        console.error('Failed to fetch users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [currentUser])

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

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
      setSelectedConversation(data.conversation)
      setCurrentView('conversation')
    } catch (error) {
      console.error('Failed to start chat:', error)
    }
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      setCurrentView('chats')
    }
  }

  const onlineUsers = filteredUsers.filter(u => u.isOnline)
  const offlineUsers = filteredUsers.filter(u => !u.isOnline)

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Header */}
      <header className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          {isMobile && (
            <button
              onClick={handleBack}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-600 dark:text-gray-400"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Contacts</h1>
        </div>
        
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-gray-100 dark:bg-slate-800 border-0 h-9"
          />
        </div>
      </header>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          </div>
        ) : (
          <div className="max-w-xl mx-auto py-3">
            {/* Invite Friend */}
            <div className="px-3 py-2">
              <div className="flex items-center gap-3 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-800 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserPlus className="w-5 h-5 text-teal-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">Invite Friends</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Share LoyalChat with friends</p>
                </div>
              </div>
            </div>

            {/* Online Section */}
            {onlineUsers.length > 0 && (
              <div className="px-3 py-1.5">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
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
                className="px-3 py-1"
              >
                <div className="flex items-center gap-2.5 p-2.5 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors">
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback className="bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-300 text-sm">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">{user.name}</h3>
                    <p className="text-xs text-teal-500">Online</p>
                  </div>
                  
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button
                      onClick={() => handleStartChat(user.id)}
                      className="p-1.5 hover:bg-teal-100 dark:hover:bg-teal-900/30 rounded-full text-teal-500 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 hover:bg-teal-100 dark:hover:bg-teal-900/30 rounded-full text-teal-500 transition-colors">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 hover:bg-teal-100 dark:hover:bg-teal-900/30 rounded-full text-teal-500 transition-colors">
                      <Video className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Offline Section */}
            {offlineUsers.length > 0 && (
              <div className="px-3 py-1.5 mt-1">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
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
                className="px-3 py-1"
              >
                <div 
                  onClick={() => handleStartChat(user.id)}
                  className="flex items-center gap-2.5 p-2.5 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
                >
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback className="bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-sm">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">{user.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.lastSeen ? `Last seen ${new Date(user.lastSeen).toLocaleDateString()}` : 'Offline'}
                    </p>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStartChat(user.id)
                    }}
                    className="p-1.5 hover:bg-teal-100 dark:hover:bg-teal-900/30 rounded-full text-teal-500 transition-colors flex-shrink-0"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}

            {filteredUsers.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="w-10 h-10 text-gray-300 dark:text-slate-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {searchQuery ? 'No contacts found' : 'No contacts yet'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
