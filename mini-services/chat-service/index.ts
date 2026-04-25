import { createServer } from 'http'
import { Server, Socket } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  // DO NOT change the path, it is used by Caddy to forward the request to the correct port
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// ---- Type definitions ----

interface JoinData {
  userId: string
}

interface MessageData {
  senderId: string
  receiverId: string
  message: string
  mediaUrl?: string
}

interface TypingData {
  senderId: string
  receiverId: string
}

interface SeenData {
  senderId: string
  receiverId: string
}

interface NotificationData {
  userId: string
  type: string
  title: string
  message: string
}

interface OnlineUser {
  userId: string
  socketId: string
  connectedAt: Date
}

// ---- State ----

const onlineUsers = new Map<string, OnlineUser>() // socketId -> OnlineUser
const userSocketMap = new Map<string, Set<string>>() // userId -> Set of socketIds

// ---- Helpers ----

function addUserSocket(userId: string, socketId: string): void {
  if (!userSocketMap.has(userId)) {
    userSocketMap.set(userId, new Set())
  }
  userSocketMap.get(userId)!.add(socketId)
}

function removeUserSocket(userId: string, socketId: string): void {
  const sockets = userSocketMap.get(userId)
  if (sockets) {
    sockets.delete(socketId)
    if (sockets.size === 0) {
      userSocketMap.delete(userId)
    }
  }
}

function isUserOnline(userId: string): boolean {
  return userSocketMap.has(userId) && userSocketMap.get(userId)!.size > 0
}

// ---- Connection handler ----

io.on('connection', (socket: Socket) => {
  console.log(`[PrimeX Chat] Client connected: ${socket.id}`)

  // ---- Join: User joins their personal room ----
  socket.on('join', (data: JoinData) => {
    try {
      const { userId } = data

      if (!userId) {
        socket.emit('error', { message: 'userId is required' })
        return
      }

      // Leave previous personal room if this socket was already joined
      const existingUser = onlineUsers.get(socket.id)
      if (existingUser) {
        socket.leave(existingUser.userId)
        removeUserSocket(existingUser.userId, socket.id)
      }

      // Join the user's personal room (userId as room name)
      socket.join(userId)

      // Track the user
      const onlineUser: OnlineUser = {
        userId,
        socketId: socket.id,
        connectedAt: new Date(),
      }
      onlineUsers.set(socket.id, onlineUser)
      addUserSocket(userId, socket.id)

      console.log(`[PrimeX Chat] User ${userId} joined their room (socket: ${socket.id})`)

      // Confirm join to the client
      socket.emit('joined', {
        userId,
        socketId: socket.id,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error(`[PrimeX Chat] Error handling join:`, error)
      socket.emit('error', { message: 'Failed to join room' })
    }
  })

  // ---- Message: Send message to a specific user ----
  socket.on('message', (data: MessageData) => {
    try {
      const { senderId, receiverId, message, mediaUrl } = data

      if (!senderId || !receiverId || !message) {
        socket.emit('error', { message: 'senderId, receiverId, and message are required' })
        return
      }

      const messagePayload = {
        senderId,
        receiverId,
        message,
        mediaUrl: mediaUrl || null,
        timestamp: new Date().toISOString(),
      }

      // Emit to receiver's personal room
      io.to(receiverId).emit('message', messagePayload)

      // Emit confirmation back to sender
      socket.emit('messageSent', {
        ...messagePayload,
        deliveredToOnline: isUserOnline(receiverId),
      })

      console.log(`[PrimeX Chat] Message from ${senderId} to ${receiverId}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`)
    } catch (error) {
      console.error(`[PrimeX Chat] Error handling message:`, error)
      socket.emit('error', { message: 'Failed to send message' })
    }
  })

  // ---- Typing: User is typing ----
  socket.on('typing', (data: TypingData) => {
    try {
      const { senderId, receiverId } = data

      if (!senderId || !receiverId) {
        return
      }

      io.to(receiverId).emit('typing', { senderId })
    } catch (error) {
      console.error(`[PrimeX Chat] Error handling typing:`, error)
    }
  })

  // ---- StopTyping: User stopped typing ----
  socket.on('stopTyping', (data: TypingData) => {
    try {
      const { senderId, receiverId } = data

      if (!senderId || !receiverId) {
        return
      }

      io.to(receiverId).emit('stopTyping', { senderId })
    } catch (error) {
      console.error(`[PrimeX Chat] Error handling stopTyping:`, error)
    }
  })

  // ---- Seen: Messages seen ----
  socket.on('seen', (data: SeenData) => {
    try {
      const { senderId, receiverId } = data

      if (!senderId || !receiverId) {
        return
      }

      // Emit to the other user's room (the one whose messages were seen)
      io.to(senderId).emit('seen', { seenBy: receiverId })

      console.log(`[PrimeX Chat] Messages from ${senderId} seen by ${receiverId}`)
    } catch (error) {
      console.error(`[PrimeX Chat] Error handling seen:`, error)
    }
  })

  // ---- Notification: Send notification to user ----
  socket.on('notification', (data: NotificationData) => {
    try {
      const { userId, type, title, message } = data

      if (!userId || !type || !title || !message) {
        socket.emit('error', { message: 'userId, type, title, and message are required' })
        return
      }

      const notificationPayload = {
        userId,
        type,
        title,
        message,
        timestamp: new Date().toISOString(),
      }

      io.to(userId).emit('notification', notificationPayload)

      console.log(`[PrimeX Chat] Notification sent to ${userId}: [${type}] ${title}`)
    } catch (error) {
      console.error(`[PrimeX Chat] Error handling notification:`, error)
      socket.emit('error', { message: 'Failed to send notification' })
    }
  })

  // ---- Disconnect: Clean up ----
  socket.on('disconnect', (reason) => {
    try {
      const user = onlineUsers.get(socket.id)

      if (user) {
        // Leave the user's room
        socket.leave(user.userId)

        // Remove from tracking maps
        removeUserSocket(user.userId, socket.id)
        onlineUsers.delete(socket.id)

        console.log(`[PrimeX Chat] User ${user.userId} disconnected (socket: ${socket.id}, reason: ${reason})`)
      } else {
        console.log(`[PrimeX Chat] Client disconnected: ${socket.id} (reason: ${reason})`)
      }
    } catch (error) {
      console.error(`[PrimeX Chat] Error handling disconnect:`, error)
    }
  })

  // ---- Error handling ----
  socket.on('error', (error) => {
    console.error(`[PrimeX Chat] Socket error (${socket.id}):`, error)
  })
})

// ---- Start server ----

const PORT = 3003

httpServer.listen(PORT, () => {
  console.log(`[PrimeX Chat] Socket.io server running on port ${PORT}`)
  console.log(`[PrimeX Chat] Ready for real-time chat connections`)
})

// ---- Graceful shutdown ----

function gracefulShutdown(signal: string) {
  console.log(`[PrimeX Chat] Received ${signal}, shutting down...`)

  io.disconnectSockets(true)

  httpServer.close(() => {
    console.log('[PrimeX Chat] Server closed')
    process.exit(0)
  })

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('[PrimeX Chat] Forced shutdown after timeout')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

process.on('uncaughtException', (error) => {
  console.error('[PrimeX Chat] Uncaught exception:', error)
})

process.on('unhandledRejection', (reason) => {
  console.error('[PrimeX Chat] Unhandled rejection:', reason)
})
