'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Smile } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Reaction {
  emoji: string
  count: number
  byCurrentUser?: boolean
}

interface EmojiReactionsProps {
  reactions: Reaction[] | Array<{ emoji: string; count: number }>
  isOwn: boolean
  onAddReaction?: (emoji: string) => void
}

const POPULAR_EMOJIS = ['❤️', '👍', '😂', '🔥', '😮', '😢']

export function EmojiReactions({
  reactions,
  isOwn,
  onAddReaction,
}: EmojiReactionsProps) {
  const [showPicker, setShowPicker] = useState(false)

  const handleReactionClick = (emoji: string) => {
    onAddReaction?.(emoji)
    setShowPicker(false)
  }

  return (
    <div className="flex items-center flex-wrap gap-1 mt-1.5">
      <AnimatePresence mode="popLayout">
        {reactions && reactions.map((reaction, index) => (
          <motion.button
            key={`${reaction.emoji}-${index}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`
              px-1.5 py-0.5 rounded-full text-xs font-medium
              transition-all duration-200
              ${
                reaction.byCurrentUser
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 ring-1 ring-blue-300 dark:ring-blue-700'
                  : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-500'
              }
            `}
            onClick={() => handleReactionClick(reaction.emoji)}
          >
            <span>{reaction.emoji}</span>
            {reaction.count > 1 && (
              <span className="ml-1">{reaction.count}</span>
            )}
          </motion.button>
        ))}
      </AnimatePresence>

      {/* Add Reaction Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative"
      >
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600"
          onClick={() => setShowPicker(!showPicker)}
        >
          <Smile className="w-3 h-3 text-gray-500 dark:text-gray-400" />
        </Button>

        {/* Emoji Picker Popover */}
        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`
                absolute bottom-full ${isOwn ? 'right-0' : 'left-0'} mb-2
                bg-white dark:bg-slate-800 rounded-lg shadow-lg
                p-2 z-50 border border-gray-200 dark:border-slate-700
              `}
            >
              <div className="flex gap-1">
                {POPULAR_EMOJIS.map((emoji) => (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-lg hover:bg-gray-100 dark:hover:bg-slate-700 p-1 rounded cursor-pointer transition-colors"
                    onClick={() => handleReactionClick(emoji)}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
