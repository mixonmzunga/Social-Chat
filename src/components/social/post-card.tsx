'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, MessageCircle, Share2, MoreHorizontal,
  Eye, Check, Send, X, Bookmark, BookmarkCheck,
  Copy, MessageSquare, Star, Trash2, EyeOff,
  ThumbsUp, Pencil, Download, Play, Pause,
  Maximize2, ChevronLeft, ChevronRight, Video
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn, formatTimeAgo } from '@/lib/utils'
import { useFeedStore, type Post, type Comment } from '@/store/feed-store'
import { useChatStore } from '@/store/chat-store'

interface PostCardProps {
  post: Post
  index: number
}

const reactions = ['❤️', '👍', '😍', '😂', '😮', '😢']

const cardColors = [
  'bg-gradient-to-br from-blue-50 to-cyan-50',
  'bg-gradient-to-br from-purple-50 to-pink-50',
  'bg-gradient-to-br from-amber-50 to-orange-50',
  'bg-gradient-to-br from-green-50 to-emerald-50',
  'bg-gradient-to-br from-rose-50 to-pink-50',
]

export function PostCard({ post, index }: PostCardProps) {
  const { likePost, setReaction, addComment, likeComment, bookmarkPost, sharePost, hidePost } = useFeedStore()
  const { currentUser } = useChatStore()

  const [showReactions, setShowReactions] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showShareSheet, setShowShareSheet] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: 'image' | 'video'; index: number } | null>(null)
  const [commentText, setCommentText] = useState('')
  const [copied, setCopied] = useState(false)
  const [doubleTapHeart, setDoubleTapHeart] = useState(false)
  const lastTapRef = useRef(0)
  const reactionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { incrementViews } = useFeedStore()

  const allMedia = [
    ...(post.images || []).map(url => ({ url, type: 'image' as const })),
    ...(post.videos || []).map(url => ({ url, type: 'video' as const }))
  ]

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const handleReaction = (emoji: string) => {
    setReaction(post.id, post.reaction === emoji ? null : emoji)
    setShowReactions(false)
  }

  const handleDoubleTap = () => {
    const now = Date.now()
    if (now - lastTapRef.current < 300) {
      if (!post.isLiked) {
        likePost(post.id)
        setDoubleTapHeart(true)
        setTimeout(() => setDoubleTapHeart(false), 1000)
      }
    }
    lastTapRef.current = now
  }

  const handleLikeButton = () => {
    if (post.isLiked) {
      setReaction(post.id, null)
    } else {
      setReaction(post.id, '❤️')
    }
  }

  const handleSubmitComment = () => {
    if (!commentText.trim()) return
    addComment(post.id, {
      authorName: currentUser?.name || 'You',
      authorUsername: currentUser?.username || '@you',
      content: commentText.trim(),
      timestamp: 'just now',
    })
    setCommentText('')
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://loyachat.app/post/${post.id}`).catch(() => { })
    setCopied(true)
    sharePost(post.id)
    setTimeout(() => { setCopied(false); setShowShareSheet(false) }, 1500)
  }

  const showReactionPicker = () => {
    if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current)
    setShowReactions(true)
  }
  const hideReactionPicker = () => {
    reactionTimerRef.current = setTimeout(() => setShowReactions(false), 200)
  }

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          'rounded-3xl overflow-hidden shadow-sm',
          cardColors[index % cardColors.length],
          'dark:from-slate-800 dark:to-slate-800'
        )}
      >
        {/* Post Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 ring-2 ring-white shadow-sm">
              <AvatarImage src={post.author.avatar || undefined} />
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
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {post.author.username} · {formatTimeAgo(post.timestamp)}
              </p>
            </div>
          </div>

          {/* Menu */}
          <div className="flex items-center gap-1">
            {/* Bookmark */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => bookmarkPost(post.id)}
              className="p-2 rounded-full hover:bg-black/5 transition-colors"
            >
              {post.isBookmarked ? (
                <BookmarkCheck className="w-5 h-5 text-violet-500" />
              ) : (
                <Bookmark className="w-5 h-5 text-gray-400" />
              )}
            </motion.button>

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
                    className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 py-2 min-w-[180px] z-20"
                  >
                    <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2">
                      <Pencil className="w-4 h-4" /> Edit post
                    </button>
                    <button
                      onClick={() => { bookmarkPost(post.id); setShowMenu(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <Bookmark className="w-4 h-4" /> {post.isBookmarked ? 'Unsave' : 'Save post'}
                    </button>
                    <button
                      onClick={() => { hidePost(post.id); setShowMenu(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <EyeOff className="w-4 h-4" /> Hide post
                    </button>
                    <button className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2">
                      <Trash2 className="w-4 h-4" /> Report
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Content — double tap to like */}
        <div className="px-4 pb-3 relative" onClick={handleDoubleTap}>
          <p className="text-gray-800 dark:text-gray-200 text-lg md:text-xl leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
          <AnimatePresence>
            {doubleTapHeart && (
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <Heart className="w-20 h-20 text-red-500 fill-red-500 drop-shadow-xl" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Media — Images & Videos */}
        {allMedia.length > 0 && (
          <div className="px-4 pb-3">
            <div className={cn(
              'grid gap-2 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700',
              allMedia.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
            )}>
              {allMedia.slice(0, 4).map((media, mIndex) => (
                <div
                  key={`${media.type}-${mIndex}-${media.url.substring(media.url.length - 20)}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedMedia({ ...media, index: mIndex })
                    incrementViews(post.id)
                  }}
                  className={cn(
                    'relative overflow-hidden cursor-zoom-in group',
                    allMedia.length === 1 ? 'aspect-video' : 'aspect-square',
                    allMedia.length === 3 && mIndex === 0 && 'row-span-2 aspect-auto'
                  )}
                >
                  {media.type === 'image' ? (
                    <img
                      src={media.url}
                      alt={`Post image ${mIndex + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <video
                        src={media.url}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        muted
                        loop
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0 }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-transparent transition-colors">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 text-white fill-white ml-1" />
                        </div>
                      </div>
                    </div>
                  )}
                  {mIndex === 3 && allMedia.length > 4 && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                      <span className="text-2xl font-bold">+{allMedia.length - 4}</span>
                      <span className="text-[10px] font-medium uppercase tracking-wider">More</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category tag */}
        {post.category && (
          <div className="px-4 pb-2">
            <span className="text-xs px-2.5 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-full font-medium">
              #{post.category}
            </span>
          </div>
        )}

        {/* Stats Row */}
        <div className="px-4 py-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>{post.views.toLocaleString()} views</span>
          </div>
          {post.likes > 0 && <span>{post.likes.toLocaleString()} likes</span>}
          {post.comments.length > 0 && (
            <button onClick={() => setShowComments(!showComments)} className="hover:underline">
              {post.comments.length} comment{post.comments.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="px-4 py-3 border-t border-gray-100/50 dark:border-slate-700/50 relative">
          <div className="flex items-center justify-around">
            {/* Like with Reactions */}
            <div className="relative">
              <button
                onClick={handleLikeButton}
                onMouseEnter={showReactionPicker}
                onMouseLeave={hideReactionPicker}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl transition-all',
                  post.isLiked
                    ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-500'
                    : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300'
                )}
              >
                {post.reaction ? (
                  <span className="text-xl">{post.reaction}</span>
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
                    onMouseEnter={showReactionPicker}
                    onMouseLeave={hideReactionPicker}
                    className="absolute bottom-full left-0 mb-2 flex gap-1 p-2 bg-white dark:bg-slate-800 rounded-full shadow-xl border border-gray-100 dark:border-slate-700 z-30"
                  >
                    {reactions.map((emoji) => (
                      <motion.button
                        key={emoji}
                        whileHover={{ scale: 1.3 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleReaction(emoji)}
                        className={cn(
                          'text-2xl p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors',
                          post.reaction === emoji && 'bg-violet-100 dark:bg-violet-900/30'
                        )}
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
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl transition-all',
                showComments
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500'
                  : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300'
              )}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium text-sm">Comment</span>
            </button>

            <button
              onClick={() => setShowShareSheet(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 transition-all"
            >
              <Share2 className="w-5 h-5" />
              <span className="font-medium text-sm">Share</span>
            </button>
          </div>

          {/* Comments Section */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-3"
              >
                {/* Existing Comments */}
                {post.comments.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {post.comments.map((comment) => (
                      <CommentItem
                        key={comment.id}
                        comment={comment}
                        onLike={() => likeComment(post.id, comment.id)}
                      />
                    ))}
                  </div>
                )}

                {/* Comment Input */}
                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-700 rounded-xl">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-pink-500 text-white text-xs">
                      {currentUser ? getInitials(currentUser.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                    placeholder="Write a comment..."
                    className="flex-1 bg-transparent text-sm outline-none text-gray-800 dark:text-white placeholder:text-gray-400"
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim()}
                    className={cn(
                      'p-2 rounded-full transition-all',
                      commentText.trim()
                        ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white'
                        : 'bg-gray-200 dark:bg-slate-600 text-gray-400'
                    )}
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.article>

      {/* Media Viewer Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <MediaViewer
            media={allMedia}
            initialIndex={selectedMedia.index}
            onClose={() => setSelectedMedia(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// --- Media Viewer Lightbox Component ---
function MediaViewer({ media, initialIndex, onClose }: { media: { url: string; type: 'image' | 'video' }[]; initialIndex: number; onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isPlaying, setIsPlaying] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const currentItem = media[currentIndex]

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = currentItem.url
    link.download = `loyachat-${Date.now()}.${currentItem.type === 'video' ? 'mp4' : 'jpg'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const next = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCurrentIndex((currentIndex + 1) % media.length)
  }

  const prev = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCurrentIndex((currentIndex - 1 + media.length) % media.length)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center"
      onClick={onClose}
    >
      {/* Header Actions */}
      <div className="absolute top-0 inset-x-0 p-6 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md pointer-events-auto transition-colors"
          >
            <X className="w-6 h-6" />
          </motion.button>
          <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-medium border border-white/10">
            {currentIndex + 1} / {media.length}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); handleDownload() }}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold pointer-events-auto shadow-lg shadow-violet-600/20"
        >
          <Download className="w-5 h-5" />
          <span>Download</span>
        </motion.button>
      </div>

      {/* Main Content */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {media.length > 1 && (
          <button
            onClick={prev}
            className="absolute left-6 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors z-10 hidden sm:block"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.9, x: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative max-w-5xl max-h-[80vh] w-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {currentItem.type === 'image' ? (
            <img
              src={currentItem.url}
              alt="viewer"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          ) : (
            <div className="relative max-w-full max-h-full flex items-center justify-center group">
              <video
                ref={videoRef}
                src={currentItem.url}
                className="max-w-full max-h-full rounded-lg shadow-2xl"
                autoPlay
                controls
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>
          )}
        </motion.div>

        {media.length > 1 && (
          <button
            onClick={next}
            className="absolute right-6 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors z-10 hidden sm:block"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}
      </div>

      {/* Thumbnails Strip */}
      {media.length > 1 && (
        <div className="absolute bottom-10 flex gap-3 px-6 overflow-x-auto max-w-full py-2">
          {media.map((item, i) => (
            <button
              key={`${item.type}-${i}-${item.url}`}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(i) }}
              className={cn(
                'w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0',
                currentIndex === i ? 'border-violet-500 scale-110 shadow-lg shadow-violet-500/20' : 'border-transparent opacity-50 hover:opacity-100'
              )}
            >
              {item.type === 'image' ? (
                <img src={item.url} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center relative">
                  <video src={item.url} className="w-full h-full object-cover" muted />
                  <Video className="w-4 h-4 text-white absolute" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// --- Comment Item Sub-component ---
function CommentItem({ comment, onLike }: { comment: Comment; onLike: () => void }) {
  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-2"
    >
      <Avatar className="w-7 h-7 flex-shrink-0">
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-[10px]">
          {getInitials(comment.authorName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 bg-gray-100 dark:bg-slate-600 rounded-2xl px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{comment.authorName}</span>
          <span className="text-xs text-gray-400">{formatTimeAgo(comment.timestamp)}</span>
        </div>
        <p className="text-[15px] md:text-base text-gray-700 dark:text-gray-200 mt-1">{comment.content}</p>
      </div>
      <button
        onClick={onLike}
        className="flex items-center gap-0.5 pt-2 flex-shrink-0"
      >
        <Heart className={cn('w-3.5 h-3.5', comment.isLiked ? 'fill-pink-500 text-pink-500' : 'text-gray-400')} />
        {comment.likes > 0 && <span className="text-[10px] text-gray-400">{comment.likes}</span>}
      </button>
    </motion.div>
  )
}
