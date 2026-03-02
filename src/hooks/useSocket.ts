'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useChatStore, Message } from '@/store/chat-store'

// Real-time updates with polling and heartbeat
const POLL_INTERVAL = 2000 // 2 seconds for faster updates
const HEARTBEAT_INTERVAL = 15000 // 15 seconds heartbeat
const MESSAGE_POLL_INTERVAL = 1000 // 1 second for messages
const USER_STATUS_INTERVAL = 3000 // 3 seconds for user status

// Play notification sound using Web Audio API
const playNotificationSound = () => {
  if (typeof window === 'undefined') return
  
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    // Create a pleasant "ding" sound
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Configure the sound - a pleasant chime
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime) // Start frequency
    oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1) // Slide down
    oscillator.type = 'sine' // Smooth sine wave
    
    // Configure volume envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01) // Attack
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3) // Decay
    
    // Play the sound
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch (error) {
    console.error('Failed to play notification sound:', error)
  }
}

// Play sent message sound - a soft "whoosh" click
const playSentSound = () => {
  if (typeof window === 'undefined') return
  
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Soft click sound
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.05)
    oscillator.type = 'sine'
    
    // Quick fade
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.005)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.08)
  } catch (error) {
    console.error('Failed to play sent sound:', error)
  }
}

export function useSocket() {
  const [isConnected, setIsConnected] = useState(true)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const messagePollRef = useRef<NodeJS.Timeout | null>(null)
  const typingPollRef = useRef<NodeJS.Timeout | null>(null)
  const lastMessageTimeRef = useRef<string>(new Date().toISOString())
  
  const {
    currentUser,
    selectedConversation,
    addMessage,
    setOnlineUsers,
    setTypingUsers,
    typingUsers,
    setConversations,
  } = useChatStore()

  // Heartbeat to keep user online
  useEffect(() => {
    if (!currentUser || typeof window === 'undefined') return

    // Send initial heartbeat
    const sendHeartbeat = async () => {
      try {
        await fetch('/api/auth/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id })
        })
      } catch (error) {
        console.error('Heartbeat error:', error)
      }
    }

    // Send heartbeat immediately
    sendHeartbeat()

    // Set up heartbeat interval
    heartbeatIntervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL)

    // Set up visibility change handler to update status when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [currentUser])

  // Poll for online users and conversations
  useEffect(() => {
    if (!currentUser || typeof window === 'undefined') return

    const poll = async () => {
      try {
        // Fetch online users
        const usersResponse = await fetch(`/api/users?excludeUserId=${currentUser.id}`)
        if (usersResponse.ok) {
          const data = await usersResponse.json()
          setOnlineUsers(data.users || [])
        }

        // Fetch updated conversations
        const convResponse = await fetch(`/api/conversations?userId=${currentUser.id}`)
        if (convResponse.ok) {
          const data = await convResponse.json()
          if (data.conversations) {
            setConversations(data.conversations)
          }
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }

    // Initial poll
    poll()

    // Set up polling interval
    pollIntervalRef.current = setInterval(poll, POLL_INTERVAL)

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [currentUser, setOnlineUsers, setConversations])

  // Poll for new messages in selected conversation
  useEffect(() => {
    if (!selectedConversation || typeof window === 'undefined') return

    const pollMessages = async () => {
      try {
        // Fetch messages newer than the last one we saw
        const response = await fetch(
          `/api/messages?conversationId=${selectedConversation.id}&limit=50&after=${lastMessageTimeRef.current}`
        )
        
        if (response.ok) {
          const data = await response.json()
          const messages: Message[] = (data.messages || []).map((m: any) => ({
            ...m,
            createdAt: new Date(m.createdAt)
          }))
          
          // Filter out our own messages and already seen messages
          const newMessages = messages.filter(
            (m: Message) => m.senderId !== currentUser?.id && 
            new Date(m.createdAt).getTime() > new Date(lastMessageTimeRef.current).getTime()
          )
          
          // Add new messages and play sound
          newMessages.forEach((msg: Message) => {
            addMessage(msg)
            // Play notification sound for messages from others
            playNotificationSound()
          })
          
          // Update last message time
          if (messages.length > 0) {
            const latestTime = messages.reduce((latest: string, msg: Message) => {
              const msgTime = new Date(msg.createdAt).toISOString()
              return msgTime > latest ? msgTime : latest
            }, lastMessageTimeRef.current)
            lastMessageTimeRef.current = latestTime
          }
        }
      } catch (error) {
        console.error('Message polling error:', error)
      }
    }

    // Reset last message time when changing conversations
    lastMessageTimeRef.current = new Date().toISOString()

    // Initial poll
    pollMessages()

    // Set up message polling interval
    messagePollRef.current = setInterval(pollMessages, MESSAGE_POLL_INTERVAL)

    return () => {
      if (messagePollRef.current) {
        clearInterval(messagePollRef.current)
      }
    }
  }, [selectedConversation, currentUser?.id, addMessage])

  // Send message via API
  const sendMessage = useCallback(async (data: {
    conversationId: string
    senderId: string
    senderName: string
    senderAvatar?: string
    content: string
    type?: 'text' | 'image' | 'file' | 'audio'
    fileUrl?: string
    fileName?: string
    fileSize?: number
  }) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (response.ok) {
        // Update last message time
        lastMessageTimeRef.current = new Date().toISOString()
        // Play sent sound
        playSentSound()
      }
    } catch (error) {
      console.error('Send message error:', error)
    }
  }, [])

  // Typing indicators - send to server and broadcast to other users
  const startTyping = useCallback(async (conversationId: string, userId: string, name: string) => {
    // Send to server so other users can see
    try {
      await fetch('/api/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, userId, name, isTyping: true })
      })
    } catch (error) {
      console.error('Start typing error:', error)
    }
  }, [])

  const stopTyping = useCallback(async (conversationId: string, userId: string) => {
    // Send to server
    try {
      await fetch('/api/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, userId, isTyping: false })
      })
    } catch (error) {
      console.error('Stop typing error:', error)
    }
  }, [])

  // Poll for typing status from other users
  useEffect(() => {
    if (!selectedConversation || !currentUser || typeof window === 'undefined') return

    const pollTyping = async () => {
      try {
        const response = await fetch(
          `/api/typing?conversationId=${selectedConversation.id}&excludeUserId=${currentUser.id}`
        )
        
        if (response.ok) {
          const data = await response.json()
          setTypingUsers(data.typingUsers || [])
        }
      } catch (error) {
        console.error('Typing poll error:', error)
      }
    }

    // Poll every 500ms for faster typing updates
    typingPollRef.current = setInterval(pollTyping, 500)

    return () => {
      if (typingPollRef.current) {
        clearInterval(typingPollRef.current)
      }
    }
  }, [selectedConversation, currentUser, setTypingUsers])

  // Set user offline
  const setUserOffline = useCallback(async (userId: string) => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [])

  return {
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    setUserOffline
  }
}

// Hook for live updating last seen time
export function useLastSeen(lastSeen: Date | string | null | undefined) {
  const [displayText, setDisplayText] = useState('')

  useEffect(() => {
    const updateDisplay = () => {
      if (!lastSeen) {
        setDisplayText('offline')
        return
      }

      const d = new Date(lastSeen)
      const now = new Date()
      const diffMs = now.getTime() - d.getTime()
      const diffSec = Math.floor(diffMs / 1000)
      const diffMin = Math.floor(diffSec / 60)
      const diffHour = Math.floor(diffMin / 60)
      const diffDay = Math.floor(diffHour / 24)

      if (diffSec < 60) {
        setDisplayText('just now')
      } else if (diffMin < 60) {
        setDisplayText(`${diffMin} min ago`)
      } else if (diffHour < 24) {
        const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        setDisplayText(`today at ${time}`)
      } else if (diffDay === 1) {
        const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        setDisplayText(`yesterday at ${time}`)
      } else {
        setDisplayText(d.toLocaleDateString([], { month: 'short', day: 'numeric' }))
      }
    }

    // Initial update
    updateDisplay()

    // Update every minute
    const interval = setInterval(updateDisplay, 60000)

    return () => clearInterval(interval)
  }, [lastSeen])

  return displayText
}

// Hook for fetching user status in a conversation
export function useUserStatus(otherUserId: string | undefined) {
  const [isOnline, setIsOnline] = useState(false)
  const [lastSeen, setLastSeen] = useState<Date | null>(null)

  useEffect(() => {
    if (!otherUserId) return

    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/users/${otherUserId}`)
        if (response.ok) {
          const data = await response.json()
          setIsOnline(data.user?.isOnline || false)
          setLastSeen(data.user?.lastSeen ? new Date(data.user.lastSeen) : null)
        }
      } catch (error) {
        console.error('Failed to fetch user status:', error)
      }
    }

    // Initial fetch
    fetchStatus()

    // Poll every 3 seconds
    const interval = setInterval(fetchStatus, USER_STATUS_INTERVAL)

    return () => clearInterval(interval)
  }, [otherUserId])

  return { isOnline, lastSeen }
}
