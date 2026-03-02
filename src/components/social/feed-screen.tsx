'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Bell, RefreshCw, MessageCircle, Clock, Users, TrendingUp
} from 'lucide-react'
import { PostCard } from './post-card'
import { StoriesSection } from './stories-section'
import { CreatePostBar } from './create-post-bar'
import { FriendSuggestions } from './friend-suggestions'
import { Recommendations } from './recommendations'
import { cn } from '@/lib/utils'

// Sample posts data with Malawian names and images showcasing Malawi
const samplePosts = [
  {
    id: '1',
    author: { name: 'Chikondi Banda', username: '@chikondi_b', avatar: null, isVerified: true },
    content: 'Just finished hiking Mount Mulanje! The view from Chambe Peak was absolutely breathtaking 🏔️ The Misty heights and indigenous forests are magical! #Malawi #MountMulanje #Adventure',
    images: ['https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800&h=600&fit=crop'],
    likes: 234,
    comments: 45,
    shares: 12,
    views: 1250,
    timestamp: '2h ago',
    isLiked: false,
  },
  {
    id: '2',
    author: { name: 'Thandiwe Gondwe', username: '@thandiwe_g', avatar: null, isVerified: true },
    content: '🚀 The Warm Heart of Africa is rising! Malawi\'s tech scene is growing fast.\n\nExcited to see more startups emerging from Lilongwe and Blantyre! 💡\n\n#MalawiTech #AfricaInnovation #WarmHeartOfAfrica',
    images: [],
    likes: 1205,
    comments: 328,
    shares: 89,
    views: 8920,
    timestamp: '4h ago',
    isLiked: true,
  },
  {
    id: '3',
    author: { name: 'Mphatso Jere', username: '@mphatso_j', avatar: null, isVerified: false },
    content: 'Lake Malawi sunrise this morning 🌅 Nothing beats the golden waters of the third largest lake in Africa. Nkhotakota is peaceful and beautiful! ☀️\n\n#LakeMalawi #Nkhotakota #Sunrise',
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=600&fit=crop'],
    likes: 89,
    comments: 23,
    shares: 5,
    views: 432,
    timestamp: '5h ago',
    isLiked: false,
  },
  {
    id: '4',
    author: { name: 'Kondwani Nkhoma', username: '@kondwani_n', avatar: null, isVerified: true },
    content: 'Visited Liwonde National Park yesterday! 🦁🐘 Saw elephants, hippos, and even a pride of lions! Malawi\'s wildlife is thriving thanks to conservation efforts.\n\n#Liwonde #Safari #Wildlife #Malawi',
    images: ['https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&h=800&fit=crop', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=600&h=600&fit=crop'],
    likes: 567,
    comments: 89,
    shares: 34,
    views: 3420,
    timestamp: '8h ago',
    isLiked: false,
  },
  {
    id: '5',
    author: { name: 'Tadala Phiri', username: '@tadala_p', avatar: null, isVerified: true },
    content: 'Zomba Plateau vibes! 🌲 The ancient forests and waterfalls are a must-visit. Had traditional chambo fish at the local restaurant - delicious! 🐟\n\n#ZombaPlateau #Malawi #Travel',
    images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&h=600&fit=crop'],
    likes: 892,
    comments: 156,
    shares: 78,
    views: 5670,
    timestamp: '12h ago',
    isLiked: false,
  },
]

export function FeedScreen() {
  const [activeTab, setActiveTab] = useState<'recents' | 'friends' | 'popular'>('recents')
  const [posts, setPosts] = useState(samplePosts)

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        }
      }
      return post
    }))
  }

  return (
    <div className="pb-4">
      {/* Header - Clean Modern Style */}
      <header className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-gray-100/50 dark:border-slate-800/50">
        <div className="px-4 py-3">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Feeds</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">What's happening today</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors relative"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <motion.span 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full border-2 border-white dark:border-slate-900" 
                />
              </motion.button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {([
              { id: 'recents', label: 'Recents', icon: Clock },
              { id: 'friends', label: 'Friends', icon: Users },
              { id: 'popular', label: 'Popular', icon: TrendingUp }
            ] as const).map((tab) => {
              const Icon = tab.icon
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize",
                    activeTab === tab.id
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </motion.button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Stories Section */}
      <StoriesSection />

      {/* Create Post Bar */}
      <CreatePostBar />

      {/* Friend Suggestions */}
      <FriendSuggestions />

      {/* Recommendations */}
      <Recommendations />

      {/* Posts Section */}
      <section className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <RefreshCw className="w-3 h-3 text-white" />
            </div>
            Recent Posts
          </h2>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-sm text-violet-600 dark:text-violet-400 font-semibold flex items-center gap-1 hover:text-violet-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </motion.button>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {posts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                index={index}
                onLike={() => handleLike(post.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}
