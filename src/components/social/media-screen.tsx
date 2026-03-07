'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Image as ImageIcon, Video, Grid3X3, Bookmark, X, Play
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFeedStore } from '@/store/feed-store'
import { useChatStore } from '@/store/chat-store'

interface MediaItem {
  id: string
  postId: string
  type: 'image' | 'video'
  url: string
  title: string
  timestamp: string
}

export function MediaScreen() {
  const { posts, fetchPosts } = useFeedStore()
  const { currentUser } = useChatStore()
  const [filter, setFilter] = useState<'All' | 'Photos' | 'Videos'>('All')
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)

  // Fetch posts if empty (fallback)
  useEffect(() => {
    if (posts.length === 0) {
      fetchPosts()
    }
  }, [posts.length, fetchPosts])

  // Extract all media from posts
  const allMedia = useMemo(() => {
    const items: MediaItem[] = []

    // Process only current user's posts
    posts.forEach(post => {
      // Only include media from current user's posts
      if (post.author.userId !== currentUser?.id) return

      // Add images
      post.images?.forEach((url, idx) => {
        items.push({
          id: `${post.id}-img-${idx}`,
          postId: post.id,
          type: 'image',
          url,
          title: post.content || `Photo by ${post.author.name}`,
          timestamp: post.timestamp
        })
      })

      // Add videos
      post.videos?.forEach((url, idx) => {
        items.push({
          id: `${post.id}-vid-${idx}`,
          postId: post.id,
          type: 'video',
          url,
          title: post.content || `Video by ${post.author.name}`,
          timestamp: post.timestamp
        })
      })
    })

    // Sort by newest first
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [posts, currentUser?.id])

  // Filter media
  const filteredMedia = useMemo(() => {
    if (filter === 'All') return allMedia
    if (filter === 'Photos') return allMedia.filter(m => m.type === 'image')
    if (filter === 'Videos') return allMedia.filter(m => m.type === 'video')
    return allMedia
  }, [allMedia, filter])

  // Stats calculate
  const stats = useMemo(() => {
    return {
      photos: allMedia.filter(m => m.type === 'image').length,
      videos: allMedia.filter(m => m.type === 'video').length,
      total: allMedia.length
    }
  }, [allMedia])

  return (
    <div className="pb-4 bg-gray-50 dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b border-gray-100 dark:border-slate-700">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Media</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Your photos & videos</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 transition-colors"
                title="Grid View"
              >
                <Grid3X3 className="w-5 h-5" />
              </motion.button>
              {/* Future feature: Bookmarked media */}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {(['All', 'Photos', 'Videos'] as const).map((f) => (
              <motion.button
                key={f}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap border",
                  filter === f
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm border-transparent'
                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-200 dark:border-slate-700'
                )}
              >
                {f}
              </motion.button>
            ))}
          </div>
        </div>
      </header>

      {/* Media Grid */}
      <div className="p-4">
        {filteredMedia.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No media yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[200px] mx-auto">
              Your photos and videos will appear here when you post them.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1.5 rounded-2xl overflow-hidden">
            {filteredMedia.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => setSelectedMedia(item)}
                className="relative aspect-square bg-gray-200 dark:bg-slate-800 group cursor-pointer overflow-hidden"
              >
                {/* Media Content */}
                {item.type === 'video' ? (
                  <div className="w-full h-full relative">
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex flex-col items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={item.title || "Image"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                  <p className="text-white text-[10px] font-medium truncate drop-shadow-md">
                    {item.title}
                  </p>
                </div>

                {/* Video Badge */}
                {item.type === 'video' && (
                  <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-md rounded-md px-1.5 py-0.5 flex items-center gap-1 shadow-sm">
                    <Video className="w-3 h-3 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats */}
        {allMedia.length > 0 && (
          <div className="mt-8 mb-4 flex items-center justify-center gap-8 py-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
            <div className="text-center w-20">
              <p className="text-2xl font-bold gap-1 text-gray-900 dark:text-white flex items-center justify-center">
                {stats.total}
              </p>
              <p className="text-[11px] uppercase tracking-wider font-medium text-gray-500 mt-1">Total</p>
            </div>
            <div className="w-px h-10 bg-gray-200 dark:bg-slate-700" />
            <div className="text-center w-20">
              <p className="text-2xl font-bold gap-1 text-gray-900 dark:text-white flex items-center justify-center">
                {stats.photos}
              </p>
              <p className="text-[11px] uppercase tracking-wider font-medium text-gray-500 mt-1">Photos</p>
            </div>
            <div className="w-px h-10 bg-gray-200 dark:bg-slate-700" />
            <div className="text-center w-20">
              <p className="text-2xl font-bold gap-1 text-gray-900 dark:text-white flex items-center justify-center">
                {stats.videos}
              </p>
              <p className="text-[11px] uppercase tracking-wider font-medium text-gray-500 mt-1">Videos</p>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Media Viewer */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center"
            onClick={() => setSelectedMedia(null)}
          >
            {/* Toolbar */}
            <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
              <div className="text-white">
                <p className="text-sm font-medium line-clamp-1 max-w-[250px]">{selectedMedia.title || 'Untitled'}</p>
                <p className="text-xs text-white/70">
                  {new Date(selectedMedia.timestamp).toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMedia(null);
                }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-4xl max-h-[85vh] p-4 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking media
            >
              {selectedMedia.type === 'video' ? (
                <video
                  src={selectedMedia.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full rounded-xl shadow-2xl"
                  style={{ maxHeight: '80vh' }}
                />
              ) : (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.title}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                  style={{ maxHeight: '80vh' }}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
