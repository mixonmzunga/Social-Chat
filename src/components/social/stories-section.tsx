'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Pause, Play, ChevronLeft, ChevronRight, Camera, Type, Smile, Send, Palette } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useFeedStore } from '@/store/feed-store'
import { useChatStore } from '@/store/chat-store'
import { Button } from '@/components/ui/button'

export function StoriesSection() {
  const { stories, fetchStories, markStoryViewed, addStory } = useFeedStore()
  const { currentUser } = useChatStore()
  const [activeStory, setActiveStory] = useState<(typeof stories)[0] | null>(null)

  useEffect(() => {
    fetchStories()
  }, [fetchStories])
  const [activeItemIndex, setActiveItemIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [showAddStory, setShowAddStory] = useState(false)
  const [showTextStory, setShowTextStory] = useState(false)
  const [textContent, setTextContent] = useState('')
  const [activeBg, setActiveBg] = useState('from-violet-600 to-indigo-600')
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const scroll = (direction: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' })
  }

  const activeStories = stories.filter(s => s.hasStory && !s.isOwn)
  const currentActiveIndex = activeStories.findIndex(s => s.id === activeStory?.id)

  const openStory = (story: (typeof stories)[0]) => {
    if (story.isOwn && !story.hasStory) { setShowAddStory(true); return }
    if (!story.hasStory || !story.items.length) return
    setActiveStory(story)
    setActiveItemIndex(0)
    setIsPaused(false)
  }

  const closeStory = () => setActiveStory(null)

  const nextStory = () => {
    if (!activeStory) return

    if (activeItemIndex < activeStory.items.length - 1) {
      setActiveItemIndex(prev => prev + 1)
      setIsPaused(false)
    } else {
      markStoryViewed(activeStory.id)
      const nextUserIndex = activeStories.findIndex(s => s.id === activeStory.id) + 1
      if (nextUserIndex < activeStories.length) {
        setActiveStory(activeStories[nextUserIndex])
        setActiveItemIndex(0)
        setIsPaused(false)
      } else {
        closeStory()
      }
    }
  }

  const prevStory = () => {
    if (!activeStory) return

    if (activeItemIndex > 0) {
      setActiveItemIndex(prev => prev - 1)
      setIsPaused(false)
    } else {
      const prevUserIndex = activeStories.findIndex(s => s.id === activeStory.id) - 1
      if (prevUserIndex >= 0) {
        const prevUser = activeStories[prevUserIndex]
        setActiveStory(prevUser)
        setActiveItemIndex(prevUser.items.length - 1)
        setIsPaused(false)
      }
    }
  }

  const storyGradients = [
    'from-violet-600 via-purple-600 to-pink-500',
    'from-orange-500 via-rose-500 to-pink-500',
    'from-blue-600 via-cyan-500 to-teal-400',
    'from-amber-500 via-orange-500 to-red-500',
    'from-green-500 via-emerald-500 to-teal-500',
    'from-indigo-600 via-purple-500 to-pink-500',
  ]

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      if (dataUrl) {
        addStory({ type: 'image', content: dataUrl, userId: currentUser?.id }) // Modified this line
        setShowAddStory(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleCreateTextStory = () => {
    if (!textContent.trim()) return
    addStory({ type: 'text', content: textContent.trim(), bgColor: activeBg, userId: currentUser?.id }) // Modified this line
    setTextContent('')
    setShowTextStory(false)
    setShowAddStory(false)
  }

  const activeItem = activeStory?.items[activeItemIndex]
  const gradient = activeItem?.bgColor || storyGradients[currentActiveIndex % storyGradients.length]

  return (
    <>
      <section className="py-4">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="font-semibold text-gray-900 dark:text-white text-lg">Stories</h2>
          <button className="text-sm text-violet-600 dark:text-violet-400 font-medium hover:text-violet-700 transition-colors">
            See All
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          <div ref={scrollRef} className="flex gap-3 overflow-x-auto px-4 py-1 scrollbar-hide">
            {stories.map((story, index) => (
              <motion.button
                key={story.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => openStory(story)}
                className="flex flex-col items-center flex-shrink-0"
              >
                <div className="relative">
                  <div className={cn(
                    'w-[72px] h-[72px] rounded-[20px] p-[3px]',
                    story.isOwn
                      ? 'bg-gray-200 dark:bg-slate-600'
                      : story.isViewed
                        ? 'bg-gray-300 dark:bg-slate-600'
                        : 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-500'
                  )}>
                    <div className="w-full h-full rounded-[17px] bg-white dark:bg-slate-800 p-[2px]">
                      <Avatar className="w-full h-full rounded-[15px]">
                        <AvatarImage src={story.avatar || undefined} />
                        <AvatarFallback className={cn(
                          'rounded-[15px] font-semibold',
                          story.isOwn
                            ? 'bg-gray-100 dark:bg-slate-700 text-gray-600'
                            : 'bg-gradient-to-br from-violet-500 to-pink-500 text-white'
                        )}>
                          {story.isOwn ? <Plus className="w-6 h-6" /> : getInitials(story.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  {story.isOwn && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                      <Plus className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-medium truncate w-[72px] text-center">
                  {story.name}
                </span>
              </motion.button>
            ))}
          </div>

          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </section>

      {/* Story Viewer */}
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
              {activeStory.items.map((item, index) => (
                <div key={`progress-${index}-${item.id || index}`} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    initial={{ width: '0%' }}
                    animate={{
                      width: index < activeItemIndex ? '100%' :
                        index === activeItemIndex && !isPaused ? '100%' : '0%'
                    }}
                    transition={{
                      duration: index === activeItemIndex && !isPaused ? 5 : 0,
                      ease: 'linear'
                    }}
                    onAnimationComplete={() => {
                      if (index === activeItemIndex && !isPaused) nextStory()
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
                <button onClick={closeStory} className="p-2 rounded-full bg-white/10 text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Story Content */}
            <div
              className={cn('absolute inset-0 flex items-center justify-center', !activeItem?.bgColor && gradient)}
              onClick={() => setIsPaused(!isPaused)}
            >
              {activeItem?.type === 'image' ? (
                <img src={activeItem.content} alt="Story" className="w-full h-full object-cover" />
              ) : (
                <div className={cn('w-full h-full flex items-center justify-center p-8 text-center bg-gradient-to-br', activeItem?.bgColor || gradient)}>
                  <p className="text-3xl font-bold text-white drop-shadow-lg leading-tight">
                    {activeItem?.content}
                  </p>
                </div>
              )}
            </div>

            {/* Navigation Areas */}
            <div className="absolute inset-0 flex">
              <button onClick={(e) => { e.stopPropagation(); prevStory() }} className="w-1/3 h-full" />
              <div className="w-1/3 h-full" />
              <button onClick={(e) => { e.stopPropagation(); nextStory() }} className="w-1/3 h-full" />
            </div>

            {/* Reply Input */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent safe-area-bottom">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder={`Reply to ${activeStory.name}...`}
                  className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-3 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40"
                  onClick={(e) => e.stopPropagation()}
                />
                <button className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <span className="text-xl">❤️</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Story Modal */}
      <AnimatePresence>
        {showAddStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end"
            onClick={() => setShowAddStory(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full bg-white dark:bg-slate-900 rounded-t-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-slate-700 rounded-full mx-auto mb-6" />
              <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-2">Create a Story</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Share a moment with your friends</p>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-gray-50 dark:bg-slate-800 hover:scale-[1.02] transition-transform"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Camera</span>
                </button>
                <button
                  onClick={() => setShowTextStory(true)}
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-gray-50 dark:bg-slate-800 hover:scale-[1.02] transition-transform"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                    <Type className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Text</span>
                </button>
                <button
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-gray-50 dark:bg-slate-800 opacity-50 cursor-not-allowed"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                    <Smile className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Media</span>
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageSelect}
              />
              <button
                onClick={() => setShowAddStory(false)}
                className="w-full py-3 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-semibold"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text Story Creator */}
      <AnimatePresence>
        {showTextStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black flex flex-col"
          >
            <div className={cn('flex-1 flex flex-col transition-colors duration-500 bg-gradient-to-br', activeBg)}>
              <div className="p-4 flex items-center justify-between">
                <button onClick={() => setShowTextStory(false)} className="p-2 text-white">
                  <X className="w-6 h-6" />
                </button>
                <div className="flex gap-2">
                  {[
                    'from-violet-600 to-indigo-600',
                    'from-rose-500 to-orange-500',
                    'from-emerald-500 to-teal-500',
                    'from-blue-600 to-cyan-500',
                    'from-amber-500 to-red-500',
                    'from-pink-500 to-purple-500',
                  ].map(bg => (
                    <button
                      key={bg}
                      onClick={() => setActiveBg(bg)}
                      className={cn(
                        'w-8 h-8 rounded-full border-2 transition-all',
                        activeBg === bg ? 'border-white scale-110 shadow-lg' : 'border-white/20'
                      )}
                      style={{ background: `linear-gradient(to bottom right, ${bg.split(' ')[0].replace('from-', '')}, ${bg.split(' ')[1].replace('to-', '')})` }}
                    >
                      <div className={cn('w-full h-full rounded-full bg-gradient-to-br', bg)} />
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleCreateTextStory}
                  disabled={!textContent.trim()}
                  className="px-6 py-2 bg-white text-gray-900 rounded-full font-bold shadow-lg disabled:opacity-50"
                >
                  Share
                </button>
              </div>

              <div className="flex-1 flex items-center justify-center p-8">
                <textarea
                  autoFocus
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Type something..."
                  className="w-full bg-transparent text-white text-3xl font-bold text-center placeholder:text-white/40 focus:outline-none resize-none"
                  style={{ height: '200px' }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
