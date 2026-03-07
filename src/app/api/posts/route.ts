// Updated: 2026-03-03T22:15:20
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const posts = await db.post.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        avatar: true,
                    }
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            }
                        }
                    }
                }
            }
        })

        const mappedPosts = posts.map(post => ({
            id: post.id,
            author: {
                name: post.author.name,
                username: post.author.username || `@${post.author.name.toLowerCase().replace(/\s+/g, '_')}`,
                avatar: post.author.avatar,
                isVerified: false,
                userId: post.author.id,
            },
            content: post.content,
            images: post.images ? JSON.parse(post.images) : [],
            videos: post.videos ? JSON.parse(post.videos) : [],
            likes: post.likes,
            shares: post.shares,
            views: post.views,
            timestamp: post.createdAt.toISOString(),
            isLiked: false,
            isBookmarked: false,
            reaction: null,
            category: post.category,
            bgColor: post.bgColor,
            comments: post.comments.map(c => ({
                id: c.id,
                authorName: c.author.name,
                authorUsername: `@${c.author.name.toLowerCase().replace(/\s+/g, '_')}`,
                content: c.content,
                timestamp: c.createdAt.toISOString(),
                likes: c.likes,
                isLiked: false,
            }))
        }))

        return NextResponse.json(mappedPosts)
    } catch (error) {
        console.error('Failed to fetch posts:', error)
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { content, author, images, videos, category, bgColor } = body

        const post = await db.post.create({
            data: {
                content,
                images: JSON.stringify(images || []),
                videos: JSON.stringify(videos || []),
                category,
                bgColor,
                authorId: author.userId,
            },
            include: {
                author: true
            }
        })

        return NextResponse.json(post)
    } catch (error) {
        console.error('Failed to create post:', error)
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
    }
}
