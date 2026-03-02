import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Heartbeat endpoint to keep user online
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Update user's online status and last seen
    await db.user.update({
      where: { id: userId },
      data: {
        isOnline: true,
        lastSeen: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date()
    })
  } catch (error) {
    console.error('Heartbeat error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
