import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: postId } = await params
        const { content, authorId } = await request.json()

        const comment = await db.postComment.create({
            data: {
                content,
                postId,
                authorId
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        username: true
                    }
                },
                post: {
                    select: {
                        authorId: true,
                        content: true
                    }
                }
            }
        })

        // Create notification for post owner
        if (comment.post.authorId !== authorId) {
            await db.notification.create({
                data: {
                    userId: comment.post.authorId,
                    type: 'comment',
                    actorId: authorId,
                    actorName: comment.author.name,
                    actorAvatar: comment.author.avatar,
                    postId: postId,
                    postContent: comment.post.content?.substring(0, 50) || 'a post'
                }
            })
        }

        const mappedComment = {
            id: comment.id,
            authorName: comment.author.name,
            authorUsername: comment.author.username || `@${comment.author.name.toLowerCase().replace(/\s+/g, '_')}`,
            content: comment.content,
            timestamp: comment.createdAt.toISOString(),
            likes: comment.likes,
            isLiked: false,
        }

        return NextResponse.json(mappedComment)
    } catch (error) {
        console.error('Failed to create comment:', error)
        return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
    }
}
