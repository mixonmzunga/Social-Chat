import { NextRequest, NextResponse } from 'next/server'

// In-memory typing status store (resets on server restart)
// In production, use Redis or similar
const typingStatus = new Map<string, { userId: string; name: string; timestamp: number }>()

// Cleanup old entries (older than 5 seconds)
const cleanupOldEntries = () => {
  const now = Date.now()
  for (const [key, value] of typingStatus.entries()) {
    if (now - value.timestamp > 5000) {
      typingStatus.delete(key)
    }
  }
}

// POST - Set typing status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationId, userId, name, isTyping } = body

    if (!conversationId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const key = `${conversationId}:${userId}`

    if (isTyping) {
      typingStatus.set(key, { userId, name: name || 'User', timestamp: Date.now() })
    } else {
      typingStatus.delete(key)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Typing status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Get typing status for a conversation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    const excludeUserId = searchParams.get('excludeUserId')

    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 })
    }

    // Cleanup old entries
    cleanupOldEntries()

    // Get all typing users for this conversation (excluding the requester)
    const typingUsers: { userId: string; name: string }[] = []
    
    for (const [key, value] of typingStatus.entries()) {
      if (key.startsWith(`${conversationId}:`) && value.userId !== excludeUserId) {
        typingUsers.push({ userId: value.userId, name: value.name })
      }
    }

    return NextResponse.json({ typingUsers })
  } catch (error) {
    console.error('Get typing status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
