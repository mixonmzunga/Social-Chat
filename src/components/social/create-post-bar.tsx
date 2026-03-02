'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Image as ImageIcon, Video, MapPin, Smile, Send, X, ChevronDown,
  Globe, Users, Lock, FileText
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/store/chat-store'

type Privacy = 'public' | 'friends' | 'private'

const privacyOptions: { value: Privacy; label: string; icon: typeof Globe; description: string }[] = [
  { value: 'public', label: 'Public', icon: Globe, description: 'Anyone can see' },
  { value: 'friends', label: 'Friends', icon: Users, description: 'Your friends only' },
  { value: 'private', label: 'Private', icon: Lock, description: 'Only you' },
]

export function CreatePostBar() {
  const { currentUser } = useChatStore()
  const [content, setContent] = useState('')
  const [privacy, setPrivacy] = useState<Privacy>('public')
  const [showPrivacyMenu, setShowPrivacyMenu] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [isFocused, setIsFocused] = useState(false)

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const selectedPrivacy = privacyOptions.find(p => p.value === privacy)
  const SelectedIcon = selectedPrivacy?.icon || Globe

  const handlePost = () => {
    if (content.trim() || images.length > 0) {
      console.log('Posting:', { content, privacy, images })
      setContent('')
      setImages([])
      setIsFocused(false)
    }
  }

  const addImage = () => {
    // Simulate adding an image
    setImages([...images, `image-${Date.now()}`])
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mt-4 bg-white dark:bg-slate-800 rounded-3xl shadow-sm overflow-hidden"
    >
      <div className="p-4">
        {/* User Row */}
        <div className="flex items-start gap-3">
          <Avatar className="w-11 h-11 ring-2 ring-gray-100 dark:ring-slate-700">
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-pink-500 text-white font-semibold">
              {currentUser ? getInitials(currentUser.name) : 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            {/* Privacy Selector */}
            <div className="relative mb-2">
              <button
                onClick={() => setShowPrivacyMenu(!showPrivacyMenu)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-slate-700 rounded-full text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
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
                          onClick={() => {
                            setPrivacy(option.value)
                            setShowPrivacyMenu(false)
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors",
                            privacy === option.value && "bg-violet-50 dark:bg-violet-900/20"
                          )}
                        >
                          <Icon className={cn(
                            "w-5 h-5",
                            privacy === option.value ? "text-violet-500" : "text-gray-400"
                          )} />
                          <div className="text-left">
                            <p className={cn(
                              "text-sm font-medium",
                              privacy === option.value ? "text-violet-600 dark:text-violet-400" : "text-gray-700 dark:text-gray-200"
                            )}>
                              {option.label}
                            </p>
                            <p className="text-xs text-gray-400">{option.description}</p>
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
              placeholder="Share something..."
              className="w-full resize-none bg-transparent text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none text-[15px] leading-relaxed min-h-[40px]"
              rows={isFocused ? 3 : 1}
            />

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {images.map((img, index) => (
                  <motion.div
                    key={img}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative w-20 h-20 rounded-xl bg-gray-100 dark:bg-slate-700 overflow-hidden"
                  >
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      🖼️
                    </div>
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center"
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
      <div className="px-4 py-3 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addImage}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <ImageIcon className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">Photo</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Video className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium">Video</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <MapPin className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium">Location</span>
          </motion.button>
        </div>

        {/* Post Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePost}
          disabled={!content.trim() && images.length === 0}
          className={cn(
            "px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all",
            content.trim() || images.length > 0
              ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
              : "bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
          )}
        >
          <Send className="w-4 h-4" />
          Post
        </motion.button>
      </div>
    </motion.div>
  )
}
