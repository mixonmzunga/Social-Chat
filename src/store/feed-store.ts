import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useChatStore } from './chat-store'


export interface Comment {
    id: string
    authorName: string
    authorUsername: string
    content: string
    timestamp: string
    likes: number
    isLiked: boolean
}

export interface Post {
    id: string
    author: {
        name: string
        username: string
        avatar: string | null
        isVerified: boolean
        userId: string
    }
    content: string
    images: string[]
    videos: string[]
    likes: number
    comments: Comment[]
    shares: number
    views: number
    timestamp: string
    isLiked: boolean
    isBookmarked: boolean
    reaction: string | null
    category?: string
    bgColor?: string
}

export interface StoryItem {
    id: string
    type: 'image' | 'text'
    content: string // base64 for image, plain text for text
    timestamp: string
    bgColor?: string
    userId?: string
}

export interface Story {
    id: string
    name: string
    avatar: string | null
    items: StoryItem[]
    isOwn?: boolean
    hasStory?: boolean
    isViewed?: boolean
    userId?: string
}

export interface Notification {
    id: string
    type: 'like' | 'comment' | 'follow' | 'share'
    actorName: string
    actorAvatar: string | null
    postContent?: string
    timestamp: string
    isRead: boolean
}

type FeedFilter = 'recents' | 'friends' | 'popular' | 'category'

interface FeedState {
    posts: Post[]
    stories: Story[]
    followedUsers: Set<string>
    bookmarkedPosts: Set<string>
    likedPosts: Set<string>
    notifications: Notification[]
    activeFilter: FeedFilter
    activeCategory: string | null
    searchQuery: string
    isLoading: boolean

    // Actions
    addPost: (post: Omit<Post, 'id' | 'likes' | 'comments' | 'shares' | 'views' | 'isLiked' | 'isBookmarked' | 'reaction'>) => Promise<void>
    fetchPosts: () => Promise<void>
    incrementViews: (postId: string) => void
    likePost: (postId: string) => void
    setReaction: (postId: string, reaction: string | null) => void
    addComment: (postId: string, comment: Omit<Comment, 'id' | 'likes' | 'isLiked'>) => void
    likeComment: (postId: string, commentId: string) => void
    bookmarkPost: (postId: string) => void
    sharePost: (postId: string) => void
    hidePost: (postId: string) => void
    followUser: (userId: string) => void
    setFilter: (filter: FeedFilter) => void
    setCategory: (category: string | null) => void
    setSearchQuery: (query: string) => void
    addStory: (item: Omit<StoryItem, 'id' | 'timestamp'>) => Promise<void>
    fetchStories: () => Promise<void>
    markStoryViewed: (storyId: string) => void
    fetchNotifications: (userId: string) => Promise<void>
    markNotificationRead: (id: string, userId: string) => Promise<void>
    markAllNotificationsRead: (userId: string) => Promise<void>
    addNotification: (notification: Omit<Notification, 'id' | 'isRead'>) => void
    getFilteredPosts: () => Post[]
}

const initialPosts: Post[] = []

const initialStories: Story[] = [
    {
        id: '1', name: 'Your Story', avatar: null, isOwn: true, hasStory: false, items: []
    }
]

const initialNotifications: Notification[] = []

export const useFeedStore = create<FeedState>()(
    persist(
        (set, get) => ({
            posts: initialPosts,
            stories: initialStories,
            followedUsers: new Set([]),
            bookmarkedPosts: new Set([]),
            likedPosts: new Set([]),
            notifications: initialNotifications,
            activeFilter: 'recents',
            activeCategory: null,
            searchQuery: '',
            isLoading: false,

            fetchPosts: async () => {
                set({ isLoading: true })
                try {
                    const response = await fetch('/api/posts', { cache: 'no-store' })
                    const data = await response.json()
                    if (Array.isArray(data)) {
                        set({ posts: data })
                    } else {
                        console.error('API did not return an array:', data)
                    }
                } catch (error) {
                    console.error('Failed to fetch posts:', error)
                } finally {
                    set({ isLoading: false })
                }
            },

            fetchStories: async () => {
                try {
                    const response = await fetch('/api/stories', { cache: 'no-store' })
                    if (response.ok) {
                        const data = await response.json()
                        // Keep 'Your Story' at the front, merge others
                        const ownStory = get().stories.find(s => s.isOwn) || initialStories[0]
                        set({ stories: [ownStory, ...data] })
                    }
                } catch (error) {
                    console.error('Failed to fetch stories:', error)
                }
            },

            addPost: async (postData) => {
                try {
                    const response = await fetch('/api/posts', {
                        method: 'POST',
                        body: JSON.stringify(postData)
                    })
                    if (response.ok) {
                        const { fetchPosts } = get()
                        await fetchPosts()
                    }
                } catch (error) {
                    console.error('Failed to create post:', error)
                }
            },

            incrementViews: async (postId) => {
                try {
                    await fetch(`/api/posts/${postId}/view`, { method: 'PATCH' })
                    set((state) => ({
                        posts: state.posts.map(p => p.id === postId ? { ...p, views: p.views + 1 } : p)
                    }))
                } catch (error) {
                    console.error('Failed to increment views:', error)
                }
            },

            likePost: async (postId) => {
                const { likedPosts } = get()
                const isLiked = likedPosts.has(postId)
                const action = isLiked ? 'unlike' : 'like'

                try {
                    await fetch(`/api/posts/${postId}/like`, {
                        method: 'PATCH',
                        body: JSON.stringify({ action })
                    })

                    const newLikedPosts = new Set(likedPosts)
                    if (isLiked) newLikedPosts.delete(postId)
                    else newLikedPosts.add(postId)

                    set((state) => ({
                        likedPosts: newLikedPosts,
                        posts: state.posts.map(p => p.id === postId
                            ? { ...p, isLiked: !isLiked, likes: isLiked ? p.likes - 1 : p.likes + 1, reaction: !isLiked ? '❤️' : null }
                            : p
                        )
                    }))
                } catch (error) {
                    console.error('Failed to toggle like:', error)
                }
            },

            setReaction: async (postId, reaction) => {
                const { likedPosts } = get()
                const wasLiked = likedPosts.has(postId)
                const isNowLiked = reaction !== null

                // If the "like" status changes, tell the server
                if (wasLiked !== isNowLiked) {
                    try {
                        await fetch(`/api/posts/${postId}/like`, {
                            method: 'PATCH',
                            body: JSON.stringify({ action: isNowLiked ? 'like' : 'unlike' })
                        })
                    } catch (error) {
                        console.error('Failed to update like status on server:', error)
                    }
                }

                const newLikedPosts = new Set(likedPosts)
                if (isNowLiked) newLikedPosts.add(postId)
                else newLikedPosts.delete(postId)

                set((state) => ({
                    likedPosts: newLikedPosts,
                    posts: state.posts.map(p => p.id === postId
                        ? { ...p, reaction, isLiked: isNowLiked, likes: !p.isLiked && isNowLiked ? p.likes + 1 : p.isLiked && !isNowLiked ? p.likes - 1 : p.likes }
                        : p
                    )
                }))
            },

            addComment: async (postId, comment) => {
                const { currentUser } = useChatStore.getState()
                if (!currentUser) return

                try {
                    const response = await fetch(`/api/posts/${postId}/comments`, {
                        method: 'POST',
                        body: JSON.stringify({
                            content: comment.content,
                            authorId: currentUser.id
                        })
                    })

                    if (response.ok) {
                        const newComment = await response.json()
                        set((state) => ({
                            posts: state.posts.map(p => p.id === postId
                                ? { ...p, comments: [...p.comments, newComment] }
                                : p
                            )
                        }))
                    }
                } catch (error) {
                    console.error('Failed to add comment:', error)
                }
            },

            likeComment: (postId, commentId) => set((state) => ({
                posts: state.posts.map(p => p.id === postId
                    ? {
                        ...p,
                        comments: p.comments.map(c => c.id === commentId
                            ? { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 }
                            : c
                        )
                    }
                    : p
                )
            })),

            bookmarkPost: (postId) => set((state) => {
                const newBookmarks = new Set(state.bookmarkedPosts)
                if (newBookmarks.has(postId)) newBookmarks.delete(postId)
                else newBookmarks.add(postId)
                return {
                    bookmarkedPosts: newBookmarks,
                    posts: state.posts.map(p => p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p)
                }
            }),

            sharePost: async (postId) => {
                try {
                    await fetch(`/api/posts/${postId}/share`, { method: 'PATCH' })
                    set((state) => ({
                        posts: state.posts.map(p => p.id === postId ? { ...p, shares: p.shares + 1 } : p)
                    }))
                } catch (error) {
                    console.error('Failed to increment shares:', error)
                }
            },

            hidePost: (postId) => set((state) => ({
                posts: state.posts.filter(p => p.id !== postId)
            })),

            followUser: (userId) => set((state) => {
                const newFollowed = new Set(state.followedUsers)
                if (newFollowed.has(userId)) newFollowed.delete(userId)
                else newFollowed.add(userId)
                return { followedUsers: newFollowed }
            }),

            setFilter: (filter) => set({ activeFilter: filter, activeCategory: null, searchQuery: '' }),

            setCategory: (category) => set({ activeCategory: category, activeFilter: 'category', searchQuery: '' }),

            setSearchQuery: (query) => set({ searchQuery: query }),

            addStory: async (item) => {
                try {
                    const response = await fetch('/api/stories', {
                        method: 'POST',
                        body: JSON.stringify(item)
                    })
                    if (response.ok) {
                        const { fetchStories } = get()
                        await fetchStories()
                    }
                } catch (error) {
                    console.error('Failed to add story:', error)
                }
            },
            markStoryViewed: (storyId) => set((state) => ({
                stories: state.stories.map(s => s.id === storyId ? { ...s, isViewed: true } : s)
            })),

            fetchNotifications: async (userId) => {
                try {
                    const response = await fetch(`/api/notifications?userId=${userId}`)
                    if (response.ok) {
                        const data = await response.json()
                        set({ notifications: data.notifications || [] })
                    }
                } catch (error) {
                    console.error('Failed to fetch notifications:', error)
                }
            },

            markNotificationRead: async (id, userId) => {
                try {
                    set((state) => ({
                        notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
                    }))
                    await fetch(`/api/notifications?userId=${userId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ notificationId: id })
                    })
                } catch (error) {
                    console.error('Failed to mark notification read:', error)
                }
            },

            markAllNotificationsRead: async (userId) => {
                try {
                    set((state) => ({
                        notifications: state.notifications.map(n => ({ ...n, isRead: true }))
                    }))
                    await fetch(`/api/notifications?userId=${userId}&action=markAllRead`, {
                        method: 'PUT'
                    })
                } catch (error) {
                    console.error('Failed to mark all notifications read:', error)
                }
            },

            addNotification: (notification) => set((state) => ({
                notifications: [{ ...notification, id: `n-${Date.now()}`, isRead: false }, ...state.notifications]
            })),

            getFilteredPosts: () => {
                const { posts, activeFilter, activeCategory, searchQuery, followedUsers, likedPosts } = get()
                if (!Array.isArray(posts)) return []
                
                // Deduplicate posts by ID
                const uniquePosts = Array.from(new Map(posts.map(p => [p.id, p])).values())
                
                let filtered = uniquePosts.map(p => ({
                    ...p,
                    isLiked: likedPosts.has(p.id)
                }))

                if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase()
                    filtered = filtered.filter(p =>
                        p.content.toLowerCase().includes(q) ||
                        p.author.name.toLowerCase().includes(q) ||
                        p.author.username.toLowerCase().includes(q)
                    )
                } else if (activeFilter === 'friends') {
                    filtered = filtered.filter(p => followedUsers.has(p.author.userId))
                } else if (activeFilter === 'popular') {
                    filtered = [...filtered].sort((a, b) => b.likes - a.likes)
                } else if (activeFilter === 'category' && activeCategory) {
                    filtered = filtered.filter(p => p.category === activeCategory)
                }
                // 'recents' = default order (newest first already)

                return filtered
            },
        }),
        {
            name: 'loyachat-feed',
            storage: createJSONStorage(() => localStorage, {
                // Serialize Sets as { __type: 'Set', values: [...] } so they survive JSON round-trips
                replacer: (_key, value) => {
                    if (value instanceof Set) {
                        return { __type: 'Set', values: [...value] }
                    }
                    return value
                },
                reviver: (_key, value) => {
                    if (value && typeof value === 'object' && (value as { __type?: string }).__type === 'Set') {
                        return new Set((value as { __type: string; values: unknown[] }).values)
                    }
                    return value
                },
            }),
            // Only persist follow/bookmark/like state — transient UI state and large data (posts/stories) reset on reload
            partialize: (state) => ({
                followedUsers: state.followedUsers,
                bookmarkedPosts: state.bookmarkedPosts,
                likedPosts: state.likedPosts,
            }),
            // Merge persisted state with initial state
            merge: (persistedState, currentState) => {
                const ps = persistedState as Partial<FeedState>
                return {
                    ...currentState,
                    ...ps,
                    // Ensure these are always from the initial/fetched state, not persisted
                    posts: currentState.posts,
                    stories: currentState.stories,
                    notifications: currentState.notifications,
                }
            },
        }
    )
)
