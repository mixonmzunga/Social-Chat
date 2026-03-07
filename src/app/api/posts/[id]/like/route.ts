import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { action, userId, userName, userAvatar } = await request.json() // 'like' or 'unlike'

        // We'll also need the user making the action in a real app, assuming they pass their userId and basic info

        const post = await db.post.update({
            where: { id },
            data: {
                likes: {
                    increment: action === 'like' ? 1 : -1
                }
            }
        })

        if (action === 'like' && userId && post.authorId !== userId) {
            await db.notification.create({
                data: {
                    userId: post.authorId,
                    type: 'like',
                    actorId: userId,
                    actorName: userName || 'Someone',
                    actorAvatar: userAvatar,
                    postId: id,
                    postContent: post.content?.substring(0, 50) || 'a post'
                }
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to update likes:', error)
        return NextResponse.json({ error: 'Failed to update likes' }, { status: 500 })
    }
}
