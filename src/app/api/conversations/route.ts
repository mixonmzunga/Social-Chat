import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Get all conversations for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') // 'private', 'group', or null for all

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Users are considered offline if they haven't sent heartbeat in last 30 seconds
    const ONLINE_THRESHOLD = new Date(Date.now() - 30 * 1000)

    // Helper function to check if user is actually online
    const isActuallyOnline = (user: { isOnline: boolean; lastSeen: Date | null }) => {
      return user.isOnline && user.lastSeen && new Date(user.lastSeen) > ONLINE_THRESHOLD
    }

    // Get conversations where user is a participant
    const participations = await db.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    isOnline: true,
                    lastSeen: true
                  }
                }
              }
            },
            messages: {
              take: 1,
              orderBy: { createdAt: 'desc' },
              include: {
                sender: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true
                  }
                }
              }
            },
            group: {
              include: {
                members: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        avatar: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        conversation: {
          lastMessageAt: 'desc'
        }
      }
    })

    let conversations = participations.map(p => p.conversation)

    // Filter by type if specified
    if (type) {
      conversations = conversations.filter(c => c.type === type)
    }

    // Transform conversations for frontend
    const transformedConversations = conversations.map(conv => {
      // For private chats, get the other user's info
      const otherParticipants = conv.participants.filter(p => p.userId !== userId)
      const otherUser = otherParticipants[0]?.user

      // Fix online status for otherUser
      const otherUserWithCorrectStatus = otherUser ? {
        ...otherUser,
        isOnline: isActuallyOnline(otherUser)
      } : null

      return {
        id: conv.id,
        type: conv.type,
        name: conv.type === 'private' ? otherUser?.name : conv.name,
        avatar: conv.type === 'private' ? otherUser?.avatar : conv.avatar,
        lastMessage: conv.messages[0] || null,
        participants: conv.participants.map(p => ({
          ...p.user,
          isOnline: isActuallyOnline(p.user),
          lastReadAt: p.lastReadAt
        })),
        otherUser: conv.type === 'private' ? otherUserWithCorrectStatus : null,
        group: conv.group ? {
          ...conv.group,
          members: conv.group.members.map(m => ({
            ...m.user,
            role: m.role
          }))
        } : null,
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.createdAt
      }
    })

    return NextResponse.json({ conversations: transformedConversations })
  } catch (error) {
    console.error('Get conversations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, participantIds, name, description, creatorId } = body

    if (!creatorId || !participantIds || participantIds.length === 0) {
      return NextResponse.json(
        { error: 'Creator ID and participant IDs are required' },
        { status: 400 }
      )
    }

    // For private chats, check if conversation already exists
    if (type === 'private' && participantIds.length === 1) {
      const existingConversation = await db.conversation.findFirst({
        where: {
          type: 'private',
          participants: {
            every: {
              userId: { in: [creatorId, ...participantIds] }
            }
          }
        },
        include: {
          participants: true
        }
      })

      // Check if exactly these two users are in the conversation
      if (existingConversation && existingConversation.participants.length === 2) {
        return NextResponse.json({ 
          conversation: existingConversation,
          existed: true 
        })
      }
    }

    // Create conversation
    const conversation = await db.conversation.create({
      data: {
        type: type || 'private',
        name: type === 'group' ? name : null,
        participants: {
          create: [
            { userId: creatorId },
            ...participantIds.map((id: string) => ({ userId: id }))
          ]
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                isOnline: true,
                lastSeen: true
              }
            }
          }
        }
      }
    })

    // Create group if it's a group conversation
    if (type === 'group') {
      await db.group.create({
        data: {
          conversationId: conversation.id,
          description: description || null,
          createdBy: creatorId,
          members: {
            create: [
              { userId: creatorId, role: 'admin' },
              ...participantIds.map((id: string) => ({ userId: id, role: 'member' }))
            ]
          }
        }
      })
    }

    return NextResponse.json({ 
      conversation,
      existed: false 
    })
  } catch (error) {
    console.error('Create conversation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
