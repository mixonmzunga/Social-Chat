'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Image as ImageIcon, Video, MapPin, Send, X, ChevronDown,
  Globe, Users, Lock, CheckCircle
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/store/chat-store'
import { useFeedStore } from '@/store/feed-store'

type Privacy = 'public' | 'friends' | 'private'

const privacyOptions: { value: Privacy; label: string; icon: typeof Globe; description: string }[] = [
  { value: 'public', label: 'Public', icon: Globe, description: 'Anyone can see' },
  { value: 'friends', label: 'Friends', icon: Users, description: 'Your friends only' },
  { value: 'private', label: 'Private', icon: Lock, description: 'Only you' },
]

export function CreatePostBar() {
  const { currentUser } = useChatStore()
  const { addPost } = useFeedStore()
  const [content, setContent] = useState('')
  const [privacy, setPrivacy] = useState<Privacy>('public')
  const [showPrivacyMenu, setShowPrivacyMenu] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [videos, setVideos] = useState<string[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const selectedPrivacy = privacyOptions.find(p => p.value === privacy)
  const SelectedIcon = selectedPrivacy?.icon || Globe

  const handlePost = () => {
    if (!content.trim() && images.length === 0) return
    addPost({
      author: {
        name: currentUser?.name || 'You',
        username: currentUser?.username || '@you',
        avatar: currentUser?.avatar || null,
        isVerified: false,
        userId: currentUser?.id || 'me',
      },
      content: content.trim(),
      images,
      videos,
      timestamp: new Date().toISOString(),
    })
    setContent('')
    setImages([])
    setVideos([])
    setIsFocused(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2500)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach(file => {
      // Use FileReader to convert to base64 data URL so images persist in localStorage
      const reader = new FileReader()
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string
        if (dataUrl) setImages(prev => [...prev, dataUrl])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string
        if (dataUrl) setVideos(prev => [...prev, dataUrl])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeImage = (index: number) =>
    setImages(images.filter((_, i) => i !== index))

  const removeVideo = (index: number) =>
    setVideos(videos.filter((_, i) => i !== index))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mt-4 bg-white dark:bg-slate-800 rounded-3xl shadow-sm overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-11 h-11 ring-2 ring-gray-100 dark:ring-slate-700 flex-shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-pink-500 text-white font-semibold">
              {currentUser ? getInitials(currentUser.name) : 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            {/* Privacy Selector */}
            <div className="relative mb-2">
              <button
                onClick={() => setShowPrivacyMenu(!showPrivacyMenu)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-slate-700 rounded-full text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                <SelectedIcon className="w-3.5 h-3.5" />
                <span>{selectedPrivacy?.label}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              <AnimatePresence>
                {showPrivacyMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 py-2 min-w-[200px] z-20"
                  >
                    {privacyOptions.map((option) => {
                      const Icon = option.icon
                      return (
                        <button
                          key={option.value}
                          onClick={() => { setPrivacy(option.value); setShowPrivacyMenu(false) }}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors',
                            privacy === option.value && 'bg-violet-50 dark:bg-violet-900/20'
                          )}
                        >
                          <Icon className={cn('w-5 h-5', privacy === option.value ? 'text-violet-500' : 'text-gray-400')} />
                          <div className="text-left">
                            <p className={cn('text-base font-medium', privacy === option.value ? 'text-violet-600 dark:text-violet-400' : 'text-gray-700 dark:text-gray-200')}>
                              {option.label}
                            </p>
                            <p className="text-sm text-gray-400">{option.description}</p>
                          </div>
                        </button>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input Area */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="Share something with Malawi..."
              className="w-full resize-none bg-transparent text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none text-base md:text-lg leading-relaxed min-h-[40px]"
              rows={isFocused ? 3 : 1}
            />

            {/* Image & Video Previews */}
            {(images.length > 0 || videos.length > 0) && (
              <div className="flex flex-wrap gap-2 mt-3">
                {images.map((img, index) => (
                  <motion.div
                    key={`img-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative w-20 h-20 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700"
                  >
                    <img src={img} alt="preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </motion.div>
                ))}
                {videos.map((vid, index) => (
                  <motion.div
                    key={`vid-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative w-20 h-20 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700"
                  >
                    <video src={vid} className="w-full h-full object-cover" muted />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <Video className="w-6 h-6 text-white/50" />
                    </div>
                    <button
                      onClick={() => removeVideo(index)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageSelect}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
          >
            <ImageIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-[13px] md:text-[15px] font-medium hidden sm:inline">Photo</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = 'video/*'
              input.multiple = true
              input.onchange = (e) => handleVideoSelect(e as any)
              input.click()
            }}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
          >
            <Video className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-[13px] md:text-[15px] font-medium hidden sm:inline">Video</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
          >
            <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <span className="text-[13px] md:text-[15px] font-medium hidden sm:inline">Location</span>
          </motion.button>
        </div>

        {/* Post Button */}
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-500 text-white font-semibold text-sm flex-shrink-0"
            >
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Posted!</span>
            </motion.div>
          ) : (
            <motion.button
              key="post"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePost}
              disabled={!content.trim() && images.length === 0 && videos.length === 0}
              className={cn(
                'px-4 py-2.5 rounded-lg font-semibold text-[13px] md:text-[15px] flex items-center gap-2 transition-all flex-shrink-0 whitespace-nowrap',
                content.trim() || images.length > 0 || videos.length > 0
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                  : 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              )}
            >
              <Send className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Post</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
