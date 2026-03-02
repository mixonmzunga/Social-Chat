'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Phone, Video, MoreVertical, 
  Send, Paperclip, Smile, Mic,
  Check, CheckCheck, Loader2, Search, Camera
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useChatStore, Message } from '@/store/chat-store'
import { useSocket, useUserStatus, useLastSeen } from '@/hooks/useSocket'
import { format, isToday, isYesterday } from 'date-fns'

interface ConversationScreenProps {
  onBack?: () => void
}

export function ConversationScreen({ onBack }: ConversationScreenProps) {
  const {
    currentUser,
    selectedConversation,
    messages,
    setMessages,
    addMessage,
    typingUsers,
  } = useChatStore()

  const { sendMessage, startTyping, stopTyping } = useSocket()
  
  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Detect mobile
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return
      
      setLoading(true)
      try {
        const response = await fetch(
          `/api/messages?conversationId=${selectedConversation.id}&limit=50`
        )
        const data = await response.json()
        setMessages(data.messages || [])
      } catch (error) {
        console.error('Failed to fetch messages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [selectedConversation, setMessages])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

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

  const formatTime = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    if (isToday(d)) return 'Today'
    if (isYesterday(d)) return 'Yesterday'
    return format(d, 'MMMM d, yyyy')
  }

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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // Get other user info from conversation
  const otherUserId = selectedConversation?.otherUser?.id
  
  // Fetch real-time user status - hooks must be called before early return
  const { isOnline, lastSeen } = useUserStatus(otherUserId)
  const lastSeenText = useLastSeen(lastSeen)

  // Early return after all hooks are called
  if (!selectedConversation) return null

  const otherName = selectedConversation.name || selectedConversation.otherUser?.name || 'Unknown'
  const otherAvatar = selectedConversation.avatar || selectedConversation.otherUser?.avatar

  return (
    <div className="h-full flex flex-col bg-[#0e0e0e]">
      {/* Header */}
      <header className="bg-[#1a1a1a] px-2 py-2 flex items-center gap-2 flex-shrink-0 border-b border-white/5">
        {isMobile && onBack && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <Avatar className="w-9 h-9 ring-2 ring-purple-500/30">
              <AvatarImage src={otherAvatar || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xs font-medium">
                {getInitials(otherName)}
              </AvatarFallback>
            </Avatar>
            {/* Online indicator on avatar */}
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1a1a1a]" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h2 className="font-medium text-white truncate text-[15px]">{otherName}</h2>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              {typingUsers.length > 0 ? (
                <span className="text-purple-400">typing...</span>
              ) : isOnline ? (
                <span>Online</span>
              ) : (
                <span>{lastSeenText ? `last seen ${lastSeenText}` : 'Offline'}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto min-h-0 px-3 py-4"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(120, 0, 255, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(0, 100, 255, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(100, 50, 200, 0.05) 0%, transparent 40%)
          `,
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-4">
              <Send className="w-7 h-7 text-purple-400" />
            </div>
            <p className="text-gray-400 text-sm">
              No messages yet
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Send a message to start the conversation
            </p>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              {/* Date Separator */}
              <div className="flex items-center justify-center my-6">
                <span className="px-4 py-1.5 bg-white/5 backdrop-blur-sm rounded-full text-xs text-gray-400 uppercase tracking-wider font-medium">
                  {group.date}
                </span>
              </div>
              
              {/* Messages */}
              <div className="space-y-2">
                {group.messages.map((message, index) => {
                  const isOwn = message.senderId === currentUser?.id
                  const prevMessage = group.messages[index - 1]
                  const nextMessage = group.messages[index + 1]
                  const isFirst = !prevMessage || prevMessage.senderId !== message.senderId
                  const isLast = !nextMessage || nextMessage.senderId !== message.senderId
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${isFirst ? 'mt-3' : ''}`}
                    >
                      <div className={`max-w-[80%] sm:max-w-[70%] ${isOwn ? 'ml-12' : 'mr-12'}`}>
                        {/* Sender name for groups */}
                        {!isOwn && selectedConversation.type === 'group' && isFirst && (
                          <p className="text-xs text-purple-400 font-medium mb-1.5 ml-3">
                            {message.senderName}
                          </p>
                        )}
                        
                        {/* Message Bubble */}
                        <div
                          className={`relative px-4 py-2.5 ${
                            isOwn
                              ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white'
                              : 'bg-[#2a2a2a] text-white'
                          } ${
                            isOwn
                              ? `${isFirst ? 'rounded-tl-2xl' : 'rounded-tl-lg'} ${isLast ? 'rounded-bl-2xl' : 'rounded-bl-lg'} rounded-tr-2xl rounded-br-2xl`
                              : `${isFirst ? 'rounded-tr-2xl' : 'rounded-tr-lg'} ${isLast ? 'rounded-br-2xl' : 'rounded-br-lg'} rounded-tl-2xl rounded-bl-2xl`
                          }`}
                        >
                          <p className="text-[15px] leading-[20px] break-words whitespace-pre-wrap">{message.content}</p>
                          
                          {/* Time and Status */}
                          <div className={`flex items-center justify-end gap-1.5 mt-1 ${isOwn ? 'text-white/60' : 'text-gray-500'}`}>
                            <span className="text-[11px]">
                              {formatTime(message.createdAt)}
                            </span>
                            {isOwn && (
                              <span className="flex items-center">
                                {message.status === 'read' ? (
                                  <CheckCheck className="w-4 h-4 text-purple-300" />
                                ) : message.status === 'delivered' ? (
                                  <CheckCheck className="w-4 h-4" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
        
        {/* Typing Indicator */}
        <AnimatePresence>
          {typingUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex justify-start mt-3"
            >
              <div className="bg-[#2a2a2a] px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1 items-center">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-purple-400 rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: 0.15 }}
                    className="w-2 h-2 bg-purple-400 rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: 0.3 }}
                    className="w-2 h-2 bg-purple-400 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Message Input Bar */}
      <div className="bg-[#1a1a1a] px-3 py-2.5 flex-shrink-0 border-t border-white/5">
        <div className="flex items-center gap-2">
          {/* Emoji Button */}
          <button className="p-2 text-gray-400 hover:text-purple-400 transition-colors flex-shrink-0">
            <Smile className="w-6 h-6" />
          </button>
          
          {/* Input Field */}
          <div className="flex-1 min-w-0 relative">
            <Input
              ref={inputRef}
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
              className="w-full h-11 bg-[#2a2a2a] border-0 rounded-full px-5 text-[15px] text-white placeholder:text-gray-500 focus:ring-1 focus:ring-purple-500/50"
            />
          </div>
          
          {/* Attachment Button */}
          <button className="p-2 text-gray-400 hover:text-purple-400 transition-colors flex-shrink-0">
            <Paperclip className="w-5 h-5" />
          </button>
          
          {/* Camera Button */}
          <button className="p-2 text-gray-400 hover:text-purple-400 transition-colors flex-shrink-0">
            <Camera className="w-5 h-5" />
          </button>
          
          {/* Send/Voice Button */}
          {messageInput.trim() ? (
            <Button
              onClick={handleSend}
              disabled={sending}
              size="icon"
              className="w-11 h-11 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 flex-shrink-0 shadow-lg shadow-purple-500/25"
            >
              <Send className="w-5 h-5 text-white" />
            </Button>
          ) : (
            <button className="p-2.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-white flex-shrink-0 shadow-lg shadow-purple-500/25">
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
