import { createServer } from 'http'
import { Server, Socket } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// Types
interface OnlineUser {
  id: string
  name: string
  avatar?: string
  socketId: string
  lastSeen: Date
}

interface TypingUser {
  userId: string
  conversationId: string
  name: string
}

interface MessageData {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  type: 'text' | 'image' | 'file' | 'audio'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  createdAt: Date
  status: 'sent' | 'delivered' | 'read'
}

// In-memory storage
const onlineUsers = new Map<string, OnlineUser>()
const userSockets = new Map<string, Set<string>>() // userId -> Set of socketIds
const typingUsers = new Map<string, Set<TypingUser>>() // conversationId -> Set of typing users
const conversationRooms = new Map<string, Set<string>>() // conversationId -> Set of userIds

// Helper functions
const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36)

const getUserSockets = (userId: string): Set<string> => {
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set())
  }
  return userSockets.get(userId)!
}

const isUserOnline = (userId: string): boolean => {
  return onlineUsers.has(userId)
}

const getOnlineUsers = (): OnlineUser[] => {
  return Array.from(onlineUsers.values())
}

// Socket handlers
io.on('connection', (socket: Socket) => {
  console.log(`[Chat Service] User connected: ${socket.id}`)

  // User comes online
  socket.on('user:online', (data: { userId: string; name: string; avatar?: string }) => {
    const { userId, name, avatar } = data
    
    // Store user info
    const onlineUser: OnlineUser = {
      id: userId,
      name,
      avatar,
      socketId: socket.id,
      lastSeen: new Date()
    }
    
    onlineUsers.set(userId, onlineUser)
    getUserSockets(userId).add(socket.id)
    
    // Broadcast to all users that this user is online
    io.emit('user:status', { 
      userId, 
      isOnline: true, 
      lastSeen: new Date() 
    })
    
    // Send online users list to the connecting user
    socket.emit('users:online', { users: getOnlineUsers() })
    
    console.log(`[Chat Service] User online: ${name} (${userId})`)
  })

  // Join a conversation room
  socket.on('conversation:join', (data: { conversationId: string; userId: string }) => {
    const { conversationId, userId } = data
    
    socket.join(`conversation:${conversationId}`)
    
    if (!conversationRooms.has(conversationId)) {
      conversationRooms.set(conversationId, new Set())
    }
    conversationRooms.get(conversationId)!.add(userId)
    
    // Notify others in the conversation
    socket.to(`conversation:${conversationId}`).emit('user:joined-conversation', {
      conversationId,
      userId
    })
    
    console.log(`[Chat Service] User ${userId} joined conversation ${conversationId}`)
  })

  // Leave a conversation room
  socket.on('conversation:leave', (data: { conversationId: string; userId: string }) => {
    const { conversationId, userId } = data
    
    socket.leave(`conversation:${conversationId}`)
    
    if (conversationRooms.has(conversationId)) {
      conversationRooms.get(conversationId)!.delete(userId)
    }
    
    // Notify others in the conversation
    socket.to(`conversation:${conversationId}`).emit('user:left-conversation', {
      conversationId,
      userId
    })
    
    // Clear typing indicator for this user
    if (typingUsers.has(conversationId)) {
      const typing = typingUsers.get(conversationId)!
      for (const tu of typing) {
        if (tu.userId === userId) {
          typing.delete(tu)
        }
      }
      socket.to(`conversation:${conversationId}`).emit('typing:update', {
        conversationId,
        users: Array.from(typing)
      })
    }
    
    console.log(`[Chat Service] User ${userId} left conversation ${conversationId}`)
  })

  // Send message
  socket.on('message:send', (data: Omit<MessageData, 'id' | 'createdAt' | 'status'>) => {
    const message: MessageData = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      status: 'sent'
    }
    
    // Broadcast to conversation room
    io.to(`conversation:${data.conversationId}`).emit('message:receive', message)
    
    // Also emit to each participant's personal room for notifications
    if (conversationRooms.has(data.conversationId)) {
      const participants = conversationRooms.get(data.conversationId)!
      for (const participantId of participants) {
        if (participantId !== data.senderId) {
          io.emit(`notification:${participantId}`, {
            type: 'new_message',
            message
          })
        }
      }
    }
    
    console.log(`[Chat Service] Message sent in conversation ${data.conversationId}`)
  })

  // Message delivered
  socket.on('message:delivered', (data: { messageId: string; conversationId: string; userId: string }) => {
    io.to(`conversation:${data.conversationId}`).emit('message:status', {
      messageId: data.messageId,
      status: 'delivered',
      userId: data.userId
    })
  })

  // Message read
  socket.on('message:read', (data: { messageId: string; conversationId: string; userId: string }) => {
    io.to(`conversation:${data.conversationId}`).emit('message:status', {
      messageId: data.messageId,
      status: 'read',
      userId: data.userId
    })
  })

  // Typing start
  socket.on('typing:start', (data: { conversationId: string; userId: string; name: string }) => {
    const { conversationId, userId, name } = data
    
    if (!typingUsers.has(conversationId)) {
      typingUsers.set(conversationId, new Set())
    }
    
    const typing = typingUsers.get(conversationId)!
    const typingUser: TypingUser = { userId, conversationId, name }
    
    // Add typing user
    typing.add(typingUser)
    
    // Broadcast to conversation room
    socket.to(`conversation:${conversationId}`).emit('typing:update', {
      conversationId,
      users: Array.from(typing)
    })
  })

  // Typing stop
  socket.on('typing:stop', (data: { conversationId: string; userId: string }) => {
    const { conversationId, userId } = data
    
    if (typingUsers.has(conversationId)) {
      const typing = typingUsers.get(conversationId)!
      
      // Remove typing user
      for (const tu of typing) {
        if (tu.userId === userId) {
          typing.delete(tu)
          break
        }
      }
      
      // Broadcast to conversation room
      socket.to(`conversation:${conversationId}`).emit('typing:update', {
        conversationId,
        users: Array.from(typing)
      })
    }
  })

  // Call offer (WebRTC signaling)
  socket.on('call:offer', (data: { 
    conversationId: string; 
    callerId: string; 
    callerName: string;
    targetUserId: string;
    offer: any;
    type: 'audio' | 'video'
  }) => {
    io.emit(`call:incoming:${data.targetUserId}`, {
      conversationId: data.conversationId,
      callerId: data.callerId,
      callerName: data.callerName,
      offer: data.offer,
      type: data.type
    })
  })

  // Call answer
  socket.on('call:answer', (data: { 
    targetUserId: string; 
    answer: any;
  }) => {
    io.emit(`call:answered:${data.targetUserId}`, {
      answer: data.answer
    })
  })

  // ICE candidate
  socket.on('call:ice-candidate', (data: { 
    targetUserId: string; 
    candidate: any;
  }) => {
    io.emit(`call:ice-candidate:${data.targetUserId}`, {
      candidate: data.candidate
    })
  })

  // Call end
  socket.on('call:end', (data: { 
    conversationId: string; 
    targetUserId: string;
  }) => {
    io.emit(`call:ended:${data.targetUserId}`, {
      conversationId: data.conversationId
    })
  })

  // User goes offline
  socket.on('user:offline', (data: { userId: string }) => {
    const { userId } = data
    const user = onlineUsers.get(userId)
    
    if (user) {
      onlineUsers.delete(userId)
      
      const sockets = userSockets.get(userId)
      if (sockets) {
        sockets.delete(socket.id)
        if (sockets.size === 0) {
          userSockets.delete(userId)
          
          // Broadcast to all users that this user is offline
          io.emit('user:status', { 
            userId, 
            isOnline: false, 
            lastSeen: new Date() 
          })
        }
      }
      
      console.log(`[Chat Service] User offline: ${user.name} (${userId})`)
    }
  })

  // Disconnect
  socket.on('disconnect', () => {
    // Find and remove user by socket id
    for (const [userId, user] of onlineUsers.entries()) {
      if (user.socketId === socket.id) {
        onlineUsers.delete(userId)
        
        const sockets = userSockets.get(userId)
        if (sockets) {
          sockets.delete(socket.id)
          if (sockets.size === 0) {
            userSockets.delete(userId)
            
            // Broadcast to all users that this user is offline
            io.emit('user:status', { 
              userId, 
              isOnline: false, 
              lastSeen: new Date() 
            })
          }
        }
        
        console.log(`[Chat Service] User disconnected: ${user.name} (${userId})`)
        break
      }
    }
    
    console.log(`[Chat Service] Socket disconnected: ${socket.id}`)
  })

  // Error handling
  socket.on('error', (error: Error) => {
    console.error(`[Chat Service] Socket error (${socket.id}):`, error)
  })
})

const PORT = 3003
httpServer.listen(PORT, () => {
  console.log(`[Chat Service] WebSocket server running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Chat Service] Received SIGTERM signal, shutting down...')
  httpServer.close(() => {
    console.log('[Chat Service] Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('[Chat Service] Received SIGINT signal, shutting down...')
  httpServer.close(() => {
    console.log('[Chat Service] Server closed')
    process.exit(0)
  })
})
