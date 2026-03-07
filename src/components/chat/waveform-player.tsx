'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Music } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WaveformPlayerProps {
  audioUrl?: string
  isOwn: boolean
  duration?: number
}

export function WaveformPlayer({
  audioUrl,
  isOwn,
  duration: initialDuration,
}: WaveformPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(initialDuration || 0)
  const [waveform, setWaveform] = useState<number[]>([])
  const audioRef = useRef<HTMLAudioElement>(null)
  const animationRef = useRef<number | null>(null)

  // Generate more detailed waveform for visual effect
  useEffect(() => {
    const bars = Array.from({ length: 40 }, (_, i) => {
      // Create a more interesting waveform pattern
      const sin = Math.sin(i * 0.3) * 0.3
      const random = Math.random() * 0.6
      return Math.abs(sin) + random
    })
    setWaveform(bars)
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !audioUrl) return

    const updateProgress = () => {
      if (audio.duration) {
        setProgress(audio.currentTime)
        setDuration(audio.duration)
        animationRef.current = requestAnimationFrame(updateProgress)
      }
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
    }

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration)
    })

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(updateProgress)
    }

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [audioUrl, isPlaying])

  const handlePlayPause = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const newTime = (e.clientX - rect.left) / rect.width * duration
    audioRef.current.currentTime = newTime
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const progressPercent = duration ? (progress / duration) * 100 : 0

  return (
    <div className="w-full">
      <audio ref={audioRef} src={audioUrl} />

      {/* Container with music theme */}
      <div className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all border ${
        isOwn
          ? 'bg-blue-50 dark:bg-blue-400/20 border-blue-200 dark:border-blue-300/30'
          : 'bg-emerald-50 dark:bg-emerald-400/10 border-emerald-200 dark:border-emerald-300/30'
      }`}>
        
        {/* Music Icon */}
        <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full transition-all ${
          isOwn
            ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/40'
            : 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-lg shadow-emerald-500/40 dark:shadow-emerald-600/30'
        }`}>
          <motion.div
            animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 3, repeat: isPlaying ? Infinity : 0, ease: 'linear' }}
          >
            <Music className="w-5 h-5 md:w-6 md:h-6" />
          </motion.div>
        </div>

        {/* Play/Pause Button with improved design */}
        <Button
          size="sm"
          className={`h-9 w-9 md:h-11 md:w-11 p-0 flex-shrink-0 rounded-full transition-all transform hover:scale-110 ${
            isOwn
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/50'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/50 dark:shadow-emerald-700/40'
          }`}
          onClick={handlePlayPause}
        >
          <motion.div
            animate={isPlaying ? { scale: [1, 0.95, 1] } : { scale: 1 }}
            transition={{ duration: 0.5, repeat: isPlaying ? Infinity : 0 }}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 md:w-6 md:h-6" />
            ) : (
              <Play className="w-5 h-5 md:w-6 md:h-6 ml-0.5" />
            )}
          </motion.div>
        </Button>

        {/* Enhanced Waveform Container */}
        <div 
          className="flex-1 flex items-center justify-center gap-px h-10 md:h-12 cursor-pointer px-2"
          onClick={handleProgressClick}
          title="Click to seek"
        >
          {waveform.map((bar, index) => {
            const barProgress = index / waveform.length < progressPercent / 100
            const distance = Math.abs(index / waveform.length - progressPercent / 100)
            const animationDelay = distance * 0.02
            
            return (
              <motion.div
                key={index}
                className={`flex-1 rounded-sm md:rounded transition-all ${
                  barProgress
                    ? isOwn
                      ? 'bg-blue-600 shadow-md shadow-blue-600/60'
                      : 'bg-emerald-600 shadow-md shadow-emerald-600/60 dark:shadow-emerald-700/50'
                    : isOwn
                    ? 'bg-blue-400/70'
                    : 'bg-emerald-400/70 dark:bg-emerald-500/50'
                }`}
                style={{ 
                  height: `${Math.max(bar * 100, 4)}%`,
                  minHeight: '4px'
                }}
                animate={isPlaying ? {
                  opacity: [0.7, 1, 0.7],
                  scaleY: [1, 1.2, 1]
                } : {
                  opacity: barProgress ? 1 : 0.6,
                  scaleY: 1
                }}
                transition={{ 
                  duration: 0.6,
                  repeat: isPlaying ? Infinity : 0,
                  delay: isPlaying ? animationDelay : 0,
                  ease: 'easeInOut'
                }}
              />
            )
          })}
        </div>

        {/* Duration Display */}
        <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
          <span className={`text-xs md:text-sm font-bold tabular-nums ${
            isOwn ? 'text-blue-700 dark:text-blue-200' : 'text-emerald-700 dark:text-emerald-300'
          }`}>
            {formatTime(progress)}
          </span>
          <span className={`text-xs leading-none opacity-70 tabular-nums ${
            isOwn ? 'text-blue-600 dark:text-blue-200' : 'text-emerald-600 dark:text-emerald-300'
          }`}>
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  )
}
