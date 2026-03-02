'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronLeft, ChevronRight, X, Pause, Play } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useChatStore } from '@/store/chat-store'

// Sample stories data
const sampleStories = [
  { id: '1', name: 'Your Story', avatar: null, isOwn: true, hasNew: false },
  { id: '2', name: 'Sarah', avatar: null, isOwn: false, hasNew: true },
  { id: '3', name: 'Mike', avatar: null, isOwn: false, hasNew: true },
  { id: '4', name: 'Emma', avatar: null, isOwn: false, hasNew: true },
  { id: '5', name: 'Tech Weekly', avatar: null, isOwn: false, hasNew: false },
  { id: '6', name: 'Alex', avatar: null, isOwn: false, hasNew: true },
  { id: '7', name: 'Jordan', avatar: null, isOwn: false, hasNew: false },
  { id: '8', name: 'Taylor', avatar: null, isOwn: false, hasNew: true },
]

export function StoriesStrip() {
  const { currentUser } = useChatStore()
  const [stories] = useState(sampleStories)
  const [selectedStory, setSelectedStory] = useState<typeof sampleStories[0] | null>(null)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showScrollLeft, setShowScrollLeft] = useState(false)
  const [showScrollRight, setShowScrollRight] = useState(true)

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setShowScrollLeft(scrollLeft > 0)
      setShowScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  const openStory = (story: typeof sampleStories[0]) => {
    if (!story.isOwn) {
      setSelectedStory(story)
      setProgress(0)
      setIsPaused(false)
    }
  }

  return (
    <>
      <div className="px-4 py-3 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 relative">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Stories</h2>
          <button className="text-xs text-violet-600 dark:text-violet-400 font-medium">
            See All
          </button>
        </div>

        {/* Stories Container */}
        <div className="relative">
          {/* Scroll Left Button */}
          {showScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-slate-700 rounded-full shadow-lg flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          )}

          {/* Stories Scroll */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto scrollbar-thin pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {stories.map((story) => (
              <motion.button
                key={story.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => openStory(story)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
              >
                {/* Story Ring */}
                <div className="relative">
                  <div
                    className={`w-16 h-16 rounded-full p-[2px] ${
                      story.hasNew
                        ? 'bg-gradient-to-tr from-violet-500 via-pink-500 to-orange-400'
                        : 'bg-gray-200 dark:bg-slate-600'
                    }`}
                  >
                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 p-[2px]">
                      <Avatar className="w-full h-full">
                        <AvatarImage src={story.avatar || undefined} />
                        <AvatarFallback
                          className={`text-sm font-semibold ${
                            story.isOwn
                              ? 'bg-gradient-to-br from-violet-500 to-pink-500 text-white'
                              : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {story.isOwn ? <Plus className="w-5 h-5" /> : getInitials(story.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  {/* Add button for own story */}
                  {story.isOwn && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
                      <Plus className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>

                {/* Name */}
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate w-16 text-center">
                  {story.name}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Scroll Right Button */}
          {showScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-slate-700 rounded-full shadow-lg flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          )}
        </div>
      </div>

      {/* Full Screen Story Viewer */}
      <AnimatePresence>
        {selectedStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col"
          >
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 z-10 px-2 pt-2">
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: '0%' }}
                  animate={{ 
                    width: isPaused ? `${progress}%` : '100%',
                  }}
                  transition={{ 
                    duration: isPaused ? 0 : 5,
                    ease: 'linear'
                  }}
                  onUpdate={(latest) => {
                    if (typeof latest.width === 'string') {
                      setProgress(parseFloat(latest.width))
                    }
                  }}
                  onComplete={() => setSelectedStory(null)}
                />
              </div>
            </div>

            {/* Header */}
            <div className="absolute top-4 left-0 right-0 z-10 px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 ring-2 ring-white/20">
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-pink-500 text-white">
                    {getInitials(selectedStory.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-semibold">{selectedStory.name}</p>
                  <p className="text-white/60 text-xs">2h ago</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-2 rounded-full bg-white/10 text-white"
                >
                  {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setSelectedStory(null)}
                  className="p-2 rounded-full bg-white/10 text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Story Content */}
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-violet-600 via-pink-500 to-orange-400">
              <div className="text-center text-white">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-4xl">📸</span>
                </div>
                <p className="text-xl font-semibold mb-2">{selectedStory.name}'s Story</p>
                <p className="text-white/70 text-sm">Tap to pause/resume</p>
              </div>
            </div>

            {/* Reply Input */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder={`Reply to ${selectedStory.name}...`}
                  className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40"
                />
                <Button className="rounded-full w-12 h-12 bg-gradient-to-r from-violet-500 to-pink-500">
                  <span className="text-lg">❤️</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
