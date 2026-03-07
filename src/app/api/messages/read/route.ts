import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Mark all unread messages in a conversation as read
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { conversationId, userId } = body

        if (!conversationId || !userId) {
            return NextResponse.json(
                { error: 'Conversation ID and user ID are required' },
                { status: 400 }
            )
        }

        // Update all messages in the conversation that were not sent by this user
        // and aren't already read
        await db.message.updateMany({
            where: {
                conversationId,
                senderId: { not: userId },
                status: { not: 'read' }
            },
            data: {
                status: 'read'
            }
        })

        // Update participants' lastReadAt
        await db.conversationParticipant.update({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId
                }
            },
            data: {
                lastReadAt: new Date()
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Mark bulk read error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
