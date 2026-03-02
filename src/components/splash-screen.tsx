'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Users, Sparkles } from 'lucide-react'

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Minimum display time for splash screen
    const minDisplayTime = setTimeout(() => {
      setIsExiting(true)
      // Wait for exit animation to complete
      setTimeout(onComplete, 500)
    }, 3000)

    return () => clearTimeout(minDisplayTime)
  }, [onComplete])

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.1 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-white rounded-full blur-3xl"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.1 }}
              transition={{ duration: 1.5, delay: 0.2, ease: 'easeOut' }}
              className="absolute bottom-1/4 right-1/4 w-72 h-72 sm:w-[500px] sm:h-[500px] bg-white rounded-full blur-3xl"
            />
          </div>

          {/* Logo Container */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: 'spring', 
              stiffness: 200, 
              damping: 15,
              delay: 0.2
            }}
            className="relative z-10"
          >
            {/* Logo Background Circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: 'spring', 
                stiffness: 200, 
                damping: 20,
                delay: 0.1
              }}
              className="w-28 h-28 sm:w-36 sm:h-36 bg-white rounded-3xl shadow-2xl flex items-center justify-center"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 300, 
                  damping: 20,
                  delay: 0.4
                }}
                className="flex items-center justify-center gap-1"
              >
                <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-violet-500" />
                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-pink-500" />
              </motion.div>
            </motion.div>

            {/* Pulse Ring */}
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: 'easeOut'
              }}
              className="absolute inset-0 w-28 h-28 sm:w-36 sm:h-36 border-4 border-white/30 rounded-3xl"
            />
          </motion.div>

          {/* App Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-8 text-center relative z-10"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Social Chat
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="text-violet-100 mt-2 text-sm sm:text-base"
            >
              Connect with anyone, anywhere
            </motion.p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-8 flex items-center gap-6 text-white/70 text-xs sm:text-sm relative z-10"
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>News Feed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4" />
              <span>Real-time Chat</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>Stories</span>
            </div>
          </motion.div>

          {/* Loading Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="mt-12 relative z-10"
          >
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1, 0] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut'
                  }}
                  className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"
                />
              ))}
            </div>
          </motion.div>

          {/* Version */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1.4, duration: 0.5 }}
            className="absolute bottom-8 text-white/60 text-xs sm:text-sm"
          >
            Version 2.0.0
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
