'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Message } from '@/store/chat-store'
import { ModernMessageBubble } from './modern-message-bubble'

interface MessageGroupProps {
  group: Message[]
  isOwn: boolean
  groupIndex: number
}

export function MessageGroup({ group, isOwn, groupIndex }: MessageGroupProps) {
  const firstMessage = group[0]
  
  return (
    <div className={`flex items-start gap-2 mb-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {firstMessage.senderAvatar ? (
          <img
            src={firstMessage.senderAvatar}
            alt={firstMessage.senderName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            isOwn 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-300 text-gray-600'
          }`}>
            {firstMessage.senderName?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} flex-1`}>
        {/* Timestamp above messages */}
        <div className={`text-xs text-gray-500 mb-1 ${isOwn ? 'text-right' : 'text-left'}`}>
          {new Date(firstMessage.createdAt).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
        
        <AnimatePresence mode="popLayout">
          {group.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                type: 'spring',
                stiffness: 200,
                damping: 20,
              }}
              className="w-full"
            >
              <ModernMessageBubble
                message={message}
                isOwn={isOwn}
                isFirst={index === 0}
                isLast={index === group.length - 1}
                isGrouped={group.length > 1}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
