import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        const notifications = await db.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50
        })

        return NextResponse.json({ notifications })
    } catch (error) {
        console.error('Error fetching notifications:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const action = searchParams.get('action') // 'markRead' or 'markAllRead'

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        if (action === 'markAllRead') {
            await db.notification.updateMany({
                where: { userId, isRead: false },
                data: { isRead: true }
            })
            return NextResponse.json({ success: true })
        }

        const { notificationId } = await request.json()
        if (notificationId) {
            await db.notification.update({
                where: { id: notificationId, userId },
                data: { isRead: true }
            })
            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    } catch (error) {
        console.error('Error updating notifications:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
