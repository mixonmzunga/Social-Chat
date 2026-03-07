import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        const friendships = await db.friendship.findMany({
            where: {
                OR: [
                    { user1Id: userId },
                    { user2Id: userId }
                ]
            },
            include: {
                user1: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                        isOnline: true,
                        lastSeen: true
                    }
                },
                user2: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                        isOnline: true,
                        lastSeen: true
                    }
                }
            }
        })

        const friends = friendships.map(f => {
            return f.user1Id === userId ? f.user2 : f.user1
        })

        return NextResponse.json({ friends })
    } catch (error) {
        console.error('List friends error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
