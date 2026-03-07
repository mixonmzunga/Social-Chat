'use client'

import { useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Message } from '@/store/chat-store'
import { MessageGroup } from './message-group'
import { format, isToday, isYesterday } from 'date-fns'

interface MessageAreaProps {
  messages: Message[]
  currentUserId?: string
  loading?: boolean
  onLoadMore?: () => void
  autoScroll?: boolean
}

export function MessageArea({
  messages,
  currentUserId,
  loading = false,
  onLoadMore,
  autoScroll = true,
}: MessageAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Group messages by sender and date
  const groupedMessages = useMemo(() => {
    const groups: any[] = []
    let currentGroup: Message[] = []
    let lastSenderId: string | null = null
    let lastDate: string | null = null

    messages.forEach((msg) => {
      const msgDate = format(
        typeof msg.createdAt === 'string' ? new Date(msg.createdAt) : msg.createdAt || new Date(),
        'yyyy-MM-dd'
      )

      if (lastSenderId !== msg.senderId || lastDate !== msgDate) {
        if (currentGroup.length > 0) {
          groups.push({
            senderId: lastSenderId,
            messages: currentGroup,
            date: lastDate,
          })
        }
        currentGroup = [msg]
        lastSenderId = msg.senderId
        lastDate = msgDate
      } else {
        currentGroup.push(msg)
      }
    })

    if (currentGroup.length > 0) {
      groups.push({
        senderId: lastSenderId,
        messages: currentGroup,
        date: lastDate,
      })
    }

    return groups
  }, [messages])

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom()
    }
  }, [messages, autoScroll, scrollToBottom])

  // Handle scroll for load more
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || !onLoadMore) return

    if (scrollRef.current.scrollTop === 0) {
      onLoadMore()
    }
  }, [onLoadMore])

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 mx-auto animate-pulse" />
          <p className="text-gray-600 dark:text-gray-400">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent"
    >
      <div className="px-2 md:px-4 py-4 space-y-6 min-h-full flex flex-col">
        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="text-5xl">💬</div>
              <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
                No messages yet. Start the conversation!
              </p>
            </div>
          </div>
        )}

        {/* Message groups */}
        <AnimatePresence mode="popLayout">
          {groupedMessages.map((group, groupIndex) => (
            <motion.div
              key={`${group.senderId}-${groupIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              {/* Date divider */}
              {groupIndex === 0 && messages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center my-4"
                >
                  <div className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                    {isToday(new Date(group.date || new Date()))
                      ? 'Today'
                      : isYesterday(new Date(group.date || new Date()))
                      ? 'Yesterday'
                      : format(new Date(group.date || new Date()), 'MMM d, yyyy')}
                  </div>
                </motion.div>
              )}

              {/* Message group */}
              <MessageGroup
                group={group.messages}
                isOwn={group.senderId === currentUserId}
                groupIndex={groupIndex}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
