'use client'

import { motion } from 'framer-motion'
import { ChevronRight, Palette, Music, ChefHat, Mountain, Gamepad2, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
  icon: typeof Palette
  color: string
  bgColor: string
  members: string
}

const categories: Category[] = [
  { id: '1', name: 'Lake Malawi', icon: Mountain, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/30', members: '25.5K' },
  { id: '2', name: 'Malawian Cuisine', icon: ChefHat, color: 'text-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-900/30', members: '12.2K' },
  { id: '3', name: 'African Music', icon: Music, color: 'text-pink-500', bgColor: 'bg-pink-50 dark:bg-pink-900/30', members: '18.1K' },
  { id: '4', name: 'Safari & Wildlife', icon: Mountain, color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-900/30', members: '9.8K' },
  { id: '5', name: 'Chichewa Culture', icon: BookOpen, color: 'text-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-900/30', members: '15.3K' },
  { id: '6', name: 'Malawi Business', icon: Palette, color: 'text-violet-500', bgColor: 'bg-violet-50 dark:bg-violet-900/30', members: '7.9K' },
]

export function Recommendations() {
  return (
    <section className="px-4 py-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white text-lg">Discover</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Explore your interests</p>
        </div>
        <button className="text-sm text-violet-600 dark:text-violet-400 font-semibold flex items-center gap-1 hover:text-violet-700 transition-colors">
          See All
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map((category, index) => {
          const Icon = category.icon
          return (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "relative p-4 rounded-2xl text-left overflow-hidden group transition-all",
                category.bgColor
              )}
            >
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-16 h-16 -mr-4 -mt-4 opacity-10">
                <Icon className="w-16 h-16" />
              </div>

              {/* Icon */}
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
                "bg-white dark:bg-slate-800 shadow-sm"
              )}>
                <Icon className={cn("w-5 h-5", category.color)} />
              </div>

              {/* Content */}
              <p className="font-semibold text-gray-900 dark:text-white text-sm mb-0.5">
                {category.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {category.members} members
              </p>

              {/* Hover Indicator */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className={cn("w-5 h-5", category.color)} />
              </div>
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}
