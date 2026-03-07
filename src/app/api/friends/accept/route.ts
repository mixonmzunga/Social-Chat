import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { requestId, action } = body // action: 'accept' | 'decline'

        if (!requestId || !action) {
            return NextResponse.json({ error: 'Request ID and action are required' }, { status: 400 })
        }

        const friendRequest = await db.friendRequest.findUnique({
            where: { id: requestId }
        })

        if (!friendRequest) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 })
        }

        if (action === 'accept') {
            // Ensure user1Id < user2Id for consistency
            const [u1, u2] = [friendRequest.senderId, friendRequest.receiverId].sort()

            await db.$transaction([
                db.friendship.create({
                    data: {
                        user1Id: u1,
                        user2Id: u2
                    }
                }),
                db.friendRequest.delete({
                    where: { id: requestId }
                })
            ])

            return NextResponse.json({ success: true })
        } else {
            await db.friendRequest.delete({
                where: { id: requestId }
            })
            return NextResponse.json({ success: true })
        }
    } catch (error) {
        console.error('Accept/Decline error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
