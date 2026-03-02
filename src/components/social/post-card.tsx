'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, MessageCircle, Share2, MoreHorizontal, 
  Eye, Check, Send, X
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface Post {
  id: string
  author: {
    name: string
    username: string
    avatar: string | null
    isVerified: boolean
  }
  content: string
  images: string[]
  likes: number
  comments: number
  shares: number
  views: number
  timestamp: string
  isLiked: boolean
  bgColor: string
}

interface PostCardProps {
  post: Post
  index: number
  onLike: () => void
}

const reactions = ['❤️', '👍', '😍', '😂', '😮', '😢']

export function PostCard({ post, index, onLike }: PostCardProps) {
  const [showReactions, setShowReactions] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [selectedReaction, setSelectedReaction] = useState<string | null>(post.isLiked ? '❤️' : null)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleReaction = (emoji: string) => {
    setSelectedReaction(emoji)
    setShowReactions(false)
    if (!post.isLiked) onLike()
  }

  const cardColors = [
    'bg-gradient-to-br from-blue-50 to-cyan-50',
    'bg-gradient-to-br from-purple-50 to-pink-50',
    'bg-gradient-to-br from-amber-50 to-orange-50',
    'bg-gradient-to-br from-green-50 to-emerald-50',
    'bg-gradient-to-br from-rose-50 to-pink-50',
  ]

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        "rounded-3xl overflow-hidden shadow-sm",
        cardColors[index % cardColors.length],
        "dark:from-slate-800 dark:to-slate-800"
      )}
    >
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 ring-2 ring-white shadow-sm">
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-pink-500 text-white font-semibold">
              {getInitials(post.author.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-gray-900 dark:text-white text-[15px]">
                {post.author.name}
              </p>
              {post.author.isVerified && (
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{post.author.username}</p>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full hover:bg-black/5 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-500" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 py-2 min-w-[160px] z-20"
              >
                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700">
                  Edit post
                </button>
                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700">
                  Hide post
                </button>
                <button className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-slate-700">
                  Report
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 dark:text-gray-200 text-[15px] leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Images */}
      {post.images.length > 0 && (
        <div className="px-4 pb-3">
          <div className={cn(
            "grid gap-2 rounded-2xl overflow-hidden",
            post.images.length === 1 ? "grid-cols-1" :
            post.images.length === 2 ? "grid-cols-2" :
            "grid-cols-2"
          )}>
            {post.images.slice(0, 4).map((img, imgIndex) => (
              <div
                key={imgIndex}
                className={cn(
                  "relative overflow-hidden",
                  post.images.length === 1 ? "aspect-video" : "aspect-square",
                  post.images.length === 3 && imgIndex === 0 && "row-span-2 aspect-auto"
                )}
              >
                <img 
                  src={img} 
                  alt={`Post image ${imgIndex + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {imgIndex === 3 && post.images.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xl font-semibold">+{post.images.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="px-4 py-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" />
          <span>{post.views} views</span>
        </div>
        <span>{post.likes} likes</span>
        <span>{post.comments} comments</span>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100/50 dark:border-slate-700/50 relative">
        <div className="flex items-center justify-around">
          {/* Like with Reactions */}
          <div className="relative">
            <button
              onClick={onLike}
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setShowReactions(false)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all",
                selectedReaction
                  ? "bg-pink-50 dark:bg-pink-900/20 text-pink-500"
                  : "hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300"
              )}
            >
              {selectedReaction ? (
                <span className="text-xl">{selectedReaction}</span>
              ) : (
                <Heart className="w-5 h-5" />
              )}
              <span className="font-medium text-sm">Like</span>
            </button>

            {/* Reaction Picker */}
            <AnimatePresence>
              {showReactions && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  onMouseEnter={() => setShowReactions(true)}
                  onMouseLeave={() => setShowReactions(false)}
                  className="absolute bottom-full left-0 mb-2 flex gap-1 p-2 bg-white dark:bg-slate-800 rounded-full shadow-xl border border-gray-100 dark:border-slate-700 z-30"
                >
                  {reactions.map((emoji) => (
                    <motion.button
                      key={emoji}
                      whileHover={{ scale: 1.3 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleReaction(emoji)}
                      className="text-2xl p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium text-sm">Comment</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 transition-all">
            <Share2 className="w-5 h-5" />
            <span className="font-medium text-sm">Share</span>
          </button>
        </div>

        {/* Comment Input */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-3"
            >
              <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-700 rounded-xl">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-pink-500 text-white text-xs">
                    U
                  </AvatarFallback>
                </Avatar>
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 bg-transparent text-sm outline-none text-gray-800 dark:text-white placeholder:text-gray-400"
                />
                <button className="p-2 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  )
}
