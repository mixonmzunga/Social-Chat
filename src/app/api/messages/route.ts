import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Get messages for a conversation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    const userId = searchParams.get('userId') // Added to know who is fetching
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

    // If userId is provided, mark messages sent by others as delivered
    if (userId) {
      await db.message.updateMany({
        where: {
          conversationId,
          senderId: { not: userId },
          status: 'sent'
        },
        data: {
          status: 'delivered'
        }
      })
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
        }
      },
      orderBy: {
        createdAt: after ? 'asc' : 'desc' // Ascending for new messages, desc for history
      },
      take: after ? undefined : limit // No limit when fetching new messages
    })

    // Reverse to get chronological order (only when fetching history)
    const orderedMessages = after ? messages : messages.reverse()

    // Parse JSON fields for response
    const parsedMessages = orderedMessages.map((msg: any) => ({
      ...msg,
      location: msg.locationData ? JSON.parse(msg.locationData) : undefined,
      contact: msg.contactData ? JSON.parse(msg.contactData) : undefined,
    }))

    return NextResponse.json({ messages: parsedMessages })
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
    const { conversationId, senderId, type, fileUrl, fileName, fileSize, location, contact } = body
    let { content } = body

    if (!conversationId || !senderId) {
      return NextResponse.json(
        { error: 'Conversation ID and sender ID are required' },
        { status: 400 }
      )
    }

    // Auto-generate content for non-text types if not provided
    const msgType = type || 'text'
    if (!content) {
      const contentMap: Record<string, string> = {
        image: '📷 Image',
        video: '🎥 Video',
        audio: '🎵 Audio',
        file: '📎 File',
        location: '📍 Location shared',
        contact: '👤 Contact shared',
      }
      content = contentMap[msgType] || ''
    }

    if (!content && msgType === 'text') {
      return NextResponse.json(
        { error: 'Content is required for text messages' },
        { status: 400 }
      )
    }

    // Determine initial status based on recipient online status
    let initialStatus = 'sent'

    // Get conversation participants to check if other user is online
    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          where: {
            userId: { not: senderId }
          },
          include: {
            user: {
              select: {
                isOnline: true
              }
            }
          }
        }
      }
    })

    // If it's a private chat and the other person is online, set to delivered
    if (conversation?.type === 'private' && conversation.participants[0]?.user.isOnline) {
      initialStatus = 'delivered'
    }

    // Create message
    const message = await db.message.create({
      data: {
        conversationId,
        senderId,
        content,
        type: msgType,
        fileUrl,
        fileName,
        fileSize,
        locationData: location ? JSON.stringify(location) : null,
        contactData: contact ? JSON.stringify(contact) : null,
        status: initialStatus
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

    // Parse JSON fields back for the response
    const responseMessage = {
      ...message,
      location: message.locationData ? JSON.parse(message.locationData) : undefined,
      contact: message.contactData ? JSON.parse(message.contactData) : undefined,
    }

    // Update conversation last message time
    await db.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() }
    })

    return NextResponse.json({ message: responseMessage })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete a message
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { messageId } = body

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      )
    }

    await db.message.delete({
      where: { id: messageId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete message error:', error)
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
