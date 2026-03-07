'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Phone, Video,
  Send, Paperclip, Smile, Mic,
  Check, CheckCheck, Loader2, Search, Camera, X, Reply
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useChatStore, Message } from '@/store/chat-store'
import { useSocket, useUserStatus, useLastSeen } from '@/hooks/useSocket'
import { format, isToday, isYesterday } from 'date-fns'
import { MessageBubble } from './message-bubble'
import { MessageArea } from './message-area'
import { FileAttachmentMenu } from './file-attachment-menu'
import { ChatOptionsMenu } from './chat-options-menu'

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
    replyToMessage,
    setReplyToMessage,
  } = useChatStore()

  const { sendMessage, startTyping, stopTyping } = useSocket()

  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)

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
          `/api/messages?conversationId=${selectedConversation.id}&userId=${currentUser?.id}&limit=50`
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

  // Auto-scroll to bottom and Mark as Read
  const { markAsRead } = useSocket()

  useEffect(() => {
    // Mark messages as read when conversation is open and window is focused
    if (selectedConversation && currentUser && messages.some(m => m.senderId !== currentUser.id && m.status !== 'read')) {
      if (document.visibilityState === 'visible') {
        markAsRead(selectedConversation.id, currentUser.id)
      }
    }
  }, [messages, selectedConversation, currentUser, markAsRead])

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

  // keep view at bottom when input focuses (keyboard open on mobile)
  useEffect(() => {
    const onResize = () => {
      if (isMobile) {
        // small timeout to allow viewport to settle
        setTimeout(() => {
          // MessageArea handles scrolling internally
        }, 50)
      }
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [isMobile])

  // Send message
  const handleSend = async () => {
    if (!messageInput.trim() || !currentUser || !selectedConversation) return

    setSending(true)
    const content = messageInput.trim()
    setMessageInput('')

    // Build content with reply prefix if replying
    const replyPrefix = replyToMessage
      ? `↩ ${replyToMessage.senderName}: ${replyToMessage.type === 'image' ? '📷 Photo' : replyToMessage.content.slice(0, 60)}\n`
      : ''
    setReplyToMessage(null)

    stopTyping(selectedConversation.id, currentUser.id)

    await sendMessageWithContent({
      conversationId: selectedConversation.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar || undefined,
      content: replyPrefix + content,
      type: 'text'
    })
  }

  // Send message with content (for file sharing)
  const sendMessageWithContent = async (messageData: Omit<Message, 'id' | 'status' | 'createdAt'>) => {
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      ...messageData,
      status: 'sent',
      createdAt: new Date()
    }

    addMessage(tempMessage)

    try {
      await sendMessage(messageData)
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
    <div className={`flex flex-col bg-white dark:bg-slate-900 ${isMobile ? 'fixed inset-0' : 'h-full'}`}>
      {/* Header */}
      <header className="bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 px-2 py-2 flex items-center gap-2 flex-shrink-0 border-b border-gray-200 dark:border-white/5 sticky top-0 z-30">
        {isMobile && onBack && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors text-gray-600 dark:text-gray-400"
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
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-medium text-gray-900 dark:text-white truncate text-[15px]">{otherName}</h2>
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              {typingUsers.length > 0 ? (
                <span className="text-purple-600 dark:text-purple-400">typing...</span>
              ) : isOnline ? (
                <span>Online</span>
              ) : (
                <span>{lastSeenText ? `last seen ${lastSeenText}` : 'Offline'}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors text-gray-600 dark:text-gray-400">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors text-gray-600 dark:text-gray-400">
            <Phone className="w-5 h-5" />
          </button>
          <ChatOptionsMenu
            conversationId={selectedConversation.id}
            otherUserId={selectedConversation.otherUser?.id}
            otherUserName={otherName}
            otherUserAvatar={otherAvatar}
          />
        </div>
      </header>

      {/* Messages Area - Modern Message Component */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* Typing Indicator - positioned absolutely */}
        <AnimatePresence>
          {typingUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-0 left-0 right-0 flex justify-start px-3 py-2 z-10"
            >
              <div className="bg-gray-100 dark:bg-slate-700 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm dark:shadow-md">
                <div className="flex gap-1 items-center">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: 0.15 }}
                    className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: 0.3 }}
                    className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message Area Component */}
        <MessageArea
          messages={messages}
          currentUserId={currentUser?.id}
          loading={loading}
          autoScroll={true}
        />
      </div>

      {/* Message Input Bar */}
      <div className="bg-gradient-to-b from-gray-50 to-white dark:from-slate-800 dark:to-slate-900 px-3 py-2.5 flex-shrink-0 border-t border-gray-200 dark:border-white/5 sticky bottom-0 z-20">
        {/* Reply Preview Bar */}
        <AnimatePresence>
          {replyToMessage && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 bg-white/5 dark:bg-white/5 border border-purple-500/30 rounded-xl px-3 py-2 mb-2"
            >
              <Reply className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-purple-400">{replyToMessage.senderName}</p>
                <p className="text-xs text-gray-400 truncate">
                  {replyToMessage.type === 'image' ? '📷 Photo' : replyToMessage.content.slice(0, 80)}
                </p>
              </div>
              <button
                onClick={() => setReplyToMessage(null)}
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-center gap-2">
          {/* Emoji Button */}
          <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex-shrink-0">
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
              onFocus={() => {
                // MessageArea handles scrolling internally
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Message"
              className="w-full h-11 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-full px-5 text-[15px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-1 focus:ring-purple-500/50 focus:border-transparent dark:focus:ring-purple-400/50 transition-all"
            />
          </div>



          {/* Attachment Button */}
          <button
            onClick={() => setShowAttachmentMenu(true)}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex-shrink-0"
            title="Attach files"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Camera Button */}
          <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex-shrink-0">
            <Camera className="w-5 h-5" />
          </button>

          {/* Send/Voice Button */}
          {messageInput.trim() ? (
            <Button
              onClick={handleSend}
              disabled={sending}
              size="icon"
              className="w-11 h-11 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 flex-shrink-0 shadow-lg shadow-purple-500/25 transition-all"
            >
              <Send className="w-5 h-5 text-white" />
            </Button>
          ) : (
            <button className="p-2.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-white flex-shrink-0 shadow-lg shadow-purple-500/25 hover:shadow-lg hover:shadow-purple-500/40 transition-all">
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* File Attachment Menu */}
      <FileAttachmentMenu
        open={showAttachmentMenu}
        onClose={() => setShowAttachmentMenu(false)}
        onSendMessage={sendMessageWithContent}
      />

    </div>
  )
}
