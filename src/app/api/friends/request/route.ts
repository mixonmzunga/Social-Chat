import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        const requests = await db.friendRequest.findMany({
            where: {
                receiverId: userId,
                status: 'pending'
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                        isOnline: true
                    }
                }
            }
        })

        return NextResponse.json({ requests })
    } catch (error) {
        console.error('Get requests error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { senderId, receiverId } = body

        if (!senderId || !receiverId) {
            return NextResponse.json({ error: 'Sender and receiver IDs are required' }, { status: 400 })
        }

        // Check if request already exists
        const existing = await db.friendRequest.findUnique({
            where: {
                senderId_receiverId: { senderId, receiverId }
            }
        })

        if (existing) {
            return NextResponse.json({ message: 'Request already sent' })
        }

        const friendRequest = await db.friendRequest.create({
            data: {
                senderId,
                receiverId,
                status: 'pending'
            },
            include: {
                sender: {
                    select: { name: true, avatar: true }
                }
            }
        })

        await db.notification.create({
            data: {
                userId: receiverId,
                type: 'follow',
                actorId: senderId,
                actorName: friendRequest.sender.name,
                actorAvatar: friendRequest.sender.avatar,
                postContent: 'sent you a friend request'
            }
        })

        return NextResponse.json({ friendRequest })
    } catch (error) {
        console.error('Create request error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
