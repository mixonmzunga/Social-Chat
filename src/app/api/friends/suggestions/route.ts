import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        // Get users who are not the current user
        // In a more complex app, we'd also exclude current friends and pending requests
        const users = await db.user.findMany({
            where: {
                id: { not: userId },
                // Simple logic: exclude those who already have a friendship with current user
                NOT: {
                    OR: [
                        { friendships1: { some: { user2Id: userId } } },
                        { friendships2: { some: { user1Id: userId } } },
                        { sentRequests: { some: { receiverId: userId } } },
                        { receivedRequests: { some: { senderId: userId } } }
                    ]
                }
            },
            select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                isOnline: true,
                lastSeen: true
            },
            take: 20
        })

        return NextResponse.json({ users })
    } catch (error) {
        console.error('Suggestions error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
