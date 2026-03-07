import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        await db.post.update({
            where: { id },
            data: {
                shares: {
                    increment: 1
                }
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to increment shares:', error)
        return NextResponse.json({ error: 'Failed to increment shares' }, { status: 500 })
    }
}
