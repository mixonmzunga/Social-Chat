'use client'

import { motion } from 'framer-motion'
import { 
  Image as ImageIcon, Video, Grid3X3, Bookmark
} from 'lucide-react'
import { cn } from '@/lib/utils'

const mediaItems = [
  { id: '1', type: 'image', title: 'Beach sunset' },
  { id: '2', type: 'video', title: 'Birthday party' },
  { id: '3', type: 'image', title: 'Coffee morning' },
  { id: '4', type: 'image', title: 'Hiking adventure' },
  { id: '5', type: 'video', title: 'Road trip' },
  { id: '6', type: 'image', title: 'Family dinner' },
  { id: '7', type: 'image', title: 'Work event' },
  { id: '8', type: 'video', title: 'Graduation' },
  { id: '9', type: 'image', title: 'Weekend vibes' },
]

export function MediaScreen() {
  return (
    <div className="pb-4 bg-gray-50 dark:bg-slate-900">
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
                className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                <Grid3X3 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                <Bookmark className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </motion.button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2">
            {['All', 'Photos', 'Videos', 'Albums'].map((filter, index) => (
              <motion.button
                key={filter}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  index === 0
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                )}
              >
                {filter}
              </motion.button>
            ))}
          </div>
        </div>
      </header>

      {/* Media Grid */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-1.5 rounded-2xl overflow-hidden">
          {mediaItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800 group cursor-pointer overflow-hidden rounded-lg"
            >
              {/* Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                {item.type === 'video' ? (
                  <Video className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                )}
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                <span className="text-white text-xs font-medium truncate">{item.title}</span>
              </div>

              {/* Video Badge */}
              {item.type === 'video' && (
                <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                  <Video className="w-3 h-3 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-6 flex items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">156</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Photos</p>
          </div>
          <div className="w-px h-10 bg-gray-200 dark:bg-slate-700" />
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">24</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Videos</p>
          </div>
          <div className="w-px h-10 bg-gray-200 dark:bg-slate-700" />
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Albums</p>
          </div>
        </div>
      </div>
    </div>
  )
}
