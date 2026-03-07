import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

        // Cleanup expired stories (optional, but good practice)
        // await db.story.deleteMany({ where: { expiresAt: { lt: new Date() } } })

        const stories = await db.story.findMany({
            where: {
                expiresAt: {
                    gt: new Date(),
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        // Group stories by user for the UI
        const groupedStories = stories.reduce((acc: any[], story) => {
            const existingUser = acc.find((u: any) => u.userId === story.userId)
            const storyItem = {
                id: story.id,
                type: story.type,
                content: story.content,
                bgColor: story.bgColor,
                timestamp: story.createdAt.toISOString(),
            }

            if (existingUser) {
                existingUser.items.push(storyItem)
            } else {
                acc.push({
                    id: `u-${story.userId}`,
                    userId: story.userId,
                    name: story.user.name,
                    avatar: story.user.avatar,
                    hasStory: true,
                    isViewed: false, // In a real app, this would be tracked per-user
                    items: [storyItem],
                })
            }
            return acc
        }, [])

        return NextResponse.json(groupedStories)
    } catch (error) {
        console.error('Error fetching stories:', error)
        return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { type, content, bgColor, userId } = body

        // Fallback to Mixon's ID if user is not yet fully authenticated in the session
        const targetUserId = userId || 'cmm97gljn0000i53g09tc0l5u'

        const story = await db.story.create({
            data: {
                type,
                content,
                bgColor,
                userId: targetUserId,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            },
        })

        return NextResponse.json(story)
    } catch (error) {
        console.error('Error creating story:', error)
        return NextResponse.json({ error: 'Failed to create story' }, { status: 500 })
    }
}
