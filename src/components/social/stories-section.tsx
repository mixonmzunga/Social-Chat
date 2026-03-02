'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Pause, Play, ChevronLeft, ChevronRight } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface Story {
  id: string
  name: string
  avatar: string | null
  isOwn?: boolean
  hasStory?: boolean
  isViewed?: boolean
}

const sampleStories: Story[] = [
  { id: '1', name: 'Your Story', avatar: null, isOwn: true, hasStory: false },
  { id: '2', name: 'Chikondi', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', hasStory: true, isViewed: false },
  { id: '3', name: 'Thandiwe', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face', hasStory: true, isViewed: false },
  { id: '4', name: 'Kondwani', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', hasStory: true, isViewed: true },
  { id: '5', name: 'Mphatso', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', hasStory: true, isViewed: false },
  { id: '6', name: 'Tadala', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', hasStory: true, isViewed: true },
  { id: '7', name: 'Mwai', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face', hasStory: true, isViewed: false },
  { id: '8', name: 'Chimwemwe', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face', hasStory: true, isViewed: true },
]

export function StoriesSection() {
  const [stories] = useState(sampleStories)
  const [activeStory, setActiveStory] = useState<Story | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -200 : 200,
        behavior: 'smooth'
      })
    }
  }

  const openStory = (story: Story) => {
    if (!story.isOwn && story.hasStory) {
      setActiveStory(story)
      setCurrentStoryIndex(stories.findIndex(s => s.id === story.id))
      setIsPaused(false)
    }
  }

  const closeStory = () => {
    setActiveStory(null)
  }

  const nextStory = () => {
    const nextIndex = currentStoryIndex + 1
    if (nextIndex < stories.length) {
      setCurrentStoryIndex(nextIndex)
      setActiveStory(stories[nextIndex])
    } else {
      closeStory()
    }
  }

  const prevStory = () => {
    const prevIndex = currentStoryIndex - 1
    if (prevIndex > 0) {
      setCurrentStoryIndex(prevIndex)
      setActiveStory(stories[prevIndex])
    }
  }

  const activeStories = stories.filter(s => s.hasStory && !s.isOwn)
  const currentActiveIndex = activeStories.findIndex(s => s.id === activeStory?.id)

  return (
    <>
      <section className="py-4">
        {/* Section Header */}
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="font-semibold text-gray-900 dark:text-white text-lg">Stories</h2>
          <button className="text-sm text-violet-600 dark:text-violet-400 font-medium">
            See All
          </button>
        </div>

        {/* Stories Scroll */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Stories Row */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto px-4 py-1 scrollbar-hide"
          >
            {stories.map((story, index) => (
              <motion.button
                key={story.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => openStory(story)}
                className="flex flex-col items-center flex-shrink-0"
              >
                {/* Story Thumbnail */}
                <div className="relative">
                  {/* Gradient Ring */}
                  <div
                    className={cn(
                      "w-[72px] h-[72px] rounded-[20px] p-[3px]",
                      story.isOwn
                        ? "bg-gray-200 dark:bg-slate-600"
                        : story.isViewed
                        ? "bg-gray-300 dark:bg-slate-600"
                        : "bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-500"
                    )}
                  >
                    <div className="w-full h-full rounded-[17px] bg-white dark:bg-slate-800 p-[2px]">
                      <Avatar className="w-full h-full rounded-[15px]">
                        <AvatarImage src={story.avatar || undefined} />
                        <AvatarFallback
                          className={cn(
                            "rounded-[15px] font-semibold",
                            story.isOwn
                              ? "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300"
                              : "bg-gradient-to-br from-violet-500 to-pink-500 text-white"
                          )}
                        >
                          {story.isOwn ? <Plus className="w-6 h-6" /> : getInitials(story.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  {/* Add Icon for Own Story */}
                  {story.isOwn && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                      <Plus className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>

                {/* Name */}
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-medium truncate w-[72px] text-center">
                  {story.name}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </section>

      {/* Full Screen Story Viewer */}
      <AnimatePresence>
        {activeStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
          >
            {/* Progress Bars */}
            <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2 pt-12">
              {activeStories.map((_, index) => (
                <div key={index} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ 
                      width: index < currentActiveIndex ? '100%' : 
                             index === currentActiveIndex && !isPaused ? '100%' : '0%'
                    }}
                    transition={{ 
                      duration: index === currentActiveIndex && !isPaused ? 5 : 0,
                      ease: 'linear'
                    }}
                    onComplete={() => {
                      if (index === currentActiveIndex) {
                        nextStory()
                      }
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-12 left-0 right-0 z-20 px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 ring-2 ring-white/30">
                  <AvatarImage src={activeStory.avatar || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-pink-500 text-white">
                    {getInitials(activeStory.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-semibold">{activeStory.name}</p>
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
                  onClick={closeStory}
                  className="p-2 rounded-full bg-white/10 text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Story Content */}
            <div 
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500"
              onClick={() => setIsPaused(!isPaused)}
            >
              <div className="text-center text-white px-8">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-5xl">📸</span>
                </div>
                <p className="text-2xl font-semibold mb-2">{activeStory.name}'s Story</p>
                <p className="text-white/70 text-sm">Tap to pause/resume</p>
              </div>
            </div>

            {/* Navigation Areas */}
            <div className="absolute inset-0 flex">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  prevStory()
                }}
                className="w-1/3 h-full"
              />
              <div className="w-1/3 h-full" />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  nextStory()
                }}
                className="w-1/3 h-full"
              />
            </div>

            {/* Reply Input */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent safe-area-bottom">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder={`Reply to ${activeStory.name}...`}
                  className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-3 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40"
                />
                <button className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <span className="text-xl">❤️</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
