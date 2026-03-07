'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Bell, RefreshCw, MessageCircle, Clock, Users, TrendingUp,
  X, CheckCheck, ChevronDown
} from 'lucide-react'
import { PostCard } from './post-card'
import { StoriesSection } from './stories-section'
import { CreatePostBar } from './create-post-bar'
import { FriendSuggestions } from './friend-suggestions'
import { Recommendations } from './recommendations'
import { cn } from '@/lib/utils'
import { useFeedStore } from '@/store/feed-store'
import { useChatStore } from '@/store/chat-store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useEffect } from 'react'

type Tab = 'recents' | 'friends' | 'popular'

export function FeedScreen() {
  const {
    activeFilter, setFilter, setSearchQuery, searchQuery, getFilteredPosts,
    notifications, markNotificationRead, markAllNotificationsRead, activeCategory,
    fetchPosts, fetchNotifications, isLoading
  } = useFeedStore()

  const { currentUser } = useChatStore()

  const [showSearch, setShowSearch] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [visibleCount, setVisibleCount] = useState(5)

  useEffect(() => {
    fetchPosts()
    if (currentUser?.id) {
      fetchNotifications(currentUser.id)
    }
  }, [fetchPosts, fetchNotifications, currentUser?.id])

  const allPosts = getFilteredPosts()
  const displayedPosts = allPosts.slice(0, visibleCount)
  const unreadCount = notifications.filter(n => !n.isRead).length

  const handleTabClick = (tab: Tab) => {
    setFilter(tab)
    setVisibleCount(5)
  }

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    setVisibleCount(5)
    await fetchPosts()
    setIsRefreshing(false)
  }, [fetchPosts])

  const handleSearch = (q: string) => {
    setSearchQuery(q)
    setVisibleCount(10)
  }

  const notificationIcon = {
    like: '❤️', comment: '💬', follow: '👤', share: '🔁'
  }

  const tabs: { id: Tab; label: string; icon: typeof Clock }[] = [
    { id: 'recents', label: 'Recents', icon: Clock },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'popular', label: 'Popular', icon: TrendingUp },
  ]

  return (
    <div className="pb-4">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-gray-100/50 dark:border-slate-800/50">
        <div className="px-4 py-3">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">LoyalChat</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activeCategory
                    ? `#${activeCategory}`
                    : searchQuery
                      ? `Results for "${searchQuery}"`
                      : "Connect with anyone, anywhere"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search Button */}
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => { setShowSearch(true); setShowNotifications(false) }}
                className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </motion.button>

              {/* Bell Button */}
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => { setShowNotifications(true); setShowSearch(false) }}
                className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors relative"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full border-2 border-white dark:border-slate-900"
                  />
                )}
              </motion.button>
            </div>
          </div>

          {/* Search Bar (inline when active) */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-3"
              >
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 rounded-2xl px-4 py-2.5">
                  <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search posts, people..."
                    className="flex-1 bg-transparent text-base text-gray-800 dark:text-white placeholder:text-gray-400 outline-none"
                  />
                  {searchQuery && (
                    <button onClick={() => handleSearch('')}>
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                  <button
                    onClick={() => { setShowSearch(false); handleSearch('') }}
                    className="text-base text-violet-600 font-medium ml-1 flex-shrink-0"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs — hidden when searching or filtering by category */}
          {!searchQuery && !activeCategory && (
            <div className="flex gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl text-base font-medium transition-all capitalize',
                      activeFilter === tab.id
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
          )}

          {/* Active category / search pills */}
          {(searchQuery || activeCategory) && (
            <div className="flex items-center gap-2">
              <span className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-base font-medium',
                'bg-violet-600 text-white'
              )}>
                {activeCategory ? `#${activeCategory}` : `"${searchQuery}"`}
                <button onClick={() => { handleSearch(''); setFilter('recents') }}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
              <span className="text-base text-gray-500">{allPosts.length} posts</span>
            </div>
          )}
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
          <h2 className="font-bold text-gray-900 dark:text-white text-xl flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <RefreshCw className="w-3 h-3 text-white" />
            </div>
            {activeFilter === 'popular' ? 'Top Posts' : activeFilter === 'friends' ? 'Friends Posts' : activeCategory ? activeCategory : 'Recent Posts'}
            <span className="text-base font-normal text-gray-400 ml-1">({allPosts.length})</span>
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-sm text-violet-600 dark:text-violet-400 font-semibold flex items-center gap-1 hover:text-violet-700 transition-colors disabled:opacity-50"
          >
            <motion.div animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 0.8, ease: 'linear' }}>
              <RefreshCw className="w-4 h-4" />
            </motion.div>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </motion.button>
        </div>

        {/* Empty state */}
        {allPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">
              {activeFilter === 'friends' ? '👥' : searchQuery ? '🔍' : '📭'}
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-xl">
              {activeFilter === 'friends'
                ? 'Follow some people to see their posts here'
                : searchQuery
                  ? `No posts found for "${searchQuery}"`
                  : 'No posts yet'}
            </p>
            {activeFilter === 'friends' && (
              <p className="text-base text-gray-400 mt-2">Check the "Suggested for You" section below to find people</p>
            )}
          </motion.div>
        )}

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {displayedPosts.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} />
            ))}
          </AnimatePresence>
        </div>

        {/* Load More */}
        {visibleCount < allPosts.length && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setVisibleCount(v => v + 5)}
            className="w-full mt-6 py-3.5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 font-medium text-base flex items-center justify-center gap-2 hover:border-violet-400 hover:text-violet-600 transition-all"
          >
            <ChevronDown className="w-4 h-4" />
            Load more posts ({allPosts.length - visibleCount} remaining)
          </motion.button>
        )}
      </section>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowNotifications(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute top-0 right-0 bottom-0 w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-5 pt-12 pb-4 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-bold text-gray-900 dark:text-white text-2xl">Notifications</h2>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && currentUser?.id && (
                      <button
                        onClick={() => markAllNotificationsRead(currentUser.id)}
                        className="text-sm text-violet-600 font-semibold flex items-center gap-1"
                      >
                        <CheckCheck className="w-4 h-4" /> Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
                {unreadCount > 0 && (
                  <span className="text-sm text-violet-600 bg-violet-50 dark:bg-violet-900/20 px-2 py-0.5 rounded-full font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="p-4 space-y-2">
                {notifications.map((notification) => (
                  <motion.button
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => {
                      if (currentUser?.id) {
                        markNotificationRead(notification.id, currentUser.id)
                      }
                    }}
                    className={cn(
                      'w-full flex items-start gap-3 p-3 rounded-2xl text-left transition-colors',
                      !notification.isRead
                        ? 'bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100/70 dark:hover:bg-violet-900/30'
                        : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                    )}
                  >
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0 text-xl">
                      {notificationIcon[notification.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base text-gray-800 dark:text-gray-200">
                        <span className="font-semibold">{notification.actorName}</span>
                        {' '}
                        {notification.type === 'like' && 'liked your post'}
                        {notification.type === 'comment' && 'commented on your post'}
                        {notification.type === 'follow' && 'started following you'}
                        {notification.type === 'share' && 'shared your post'}
                      </p>
                      {notification.postContent && (
                        <p className="text-sm text-gray-400 truncate mt-0.5">"{notification.postContent}"</p>
                      )}
                      <p className="text-sm text-gray-400 mt-1">{notification.timestamp}</p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2.5 h-2.5 rounded-full bg-violet-500 flex-shrink-0 mt-1.5" />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
