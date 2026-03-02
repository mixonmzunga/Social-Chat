import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Get messages for a conversation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const before = searchParams.get('before') // message ID to load older messages
    const after = searchParams.get('after') // ISO timestamp to get newer messages

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      )
    }

    // Build where clause
    const whereClause: any = { conversationId }
    
    if (before) {
      whereClause.id = { lt: before }
    }
    
    if (after) {
      whereClause.createdAt = { gt: new Date(after) }
    }

    const messages = await db.message.findMany({
      where: whereClause,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        readBy: {
          include: {
            message: true
          }
        }
      },
      orderBy: {
        createdAt: after ? 'asc' : 'desc' // Ascending for new messages, desc for history
      },
      take: after ? undefined : limit // No limit when fetching new messages
    })

    // Reverse to get chronological order (only when fetching history)
    const orderedMessages = after ? messages : messages.reverse()

    return NextResponse.json({ messages: orderedMessages })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Send a message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationId, senderId, content, type, fileUrl, fileName, fileSize } = body

    if (!conversationId || !senderId || !content) {
      return NextResponse.json(
        { error: 'Conversation ID, sender ID, and content are required' },
        { status: 400 }
      )
    }

    // Create message
    const message = await db.message.create({
      data: {
        conversationId,
        senderId,
        content,
        type: type || 'text',
        fileUrl,
        fileName,
        fileSize,
        status: 'sent'
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    // Update conversation last message time
    await db.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() }
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Mark message as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { messageId, userId } = body

    if (!messageId || !userId) {
      return NextResponse.json(
        { error: 'Message ID and user ID are required' },
        { status: 400 }
      )
    }

    // Check if already read
    const existingRead = await db.messageRead.findUnique({
      where: {
        messageId_userId: {
          messageId,
          userId
        }
      }
    })

    if (!existingRead) {
      await db.messageRead.create({
        data: {
          messageId,
          userId
        }
      })
    }

    // Update message status
    const message = await db.message.update({
      where: { id: messageId },
      data: { status: 'read' }
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Mark read error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
