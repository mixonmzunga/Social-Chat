import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Get all users (for contacts)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const excludeUserId = searchParams.get('excludeUserId')
    const search = searchParams.get('search')

    // Users are considered offline if they haven't sent heartbeat in last 30 seconds
    const ONLINE_THRESHOLD = new Date(Date.now() - 30 * 1000)

    const users = await db.user.findMany({
      where: {
        ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
        ...(search ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } }
          ]
        } : {})
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        isOnline: true,
        lastSeen: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Fix online status based on lastSeen - user is online only if they sent heartbeat recently
    const usersWithCorrectStatus = users.map(user => {
      const isActuallyOnline = user.isOnline && user.lastSeen && new Date(user.lastSeen) > ONLINE_THRESHOLD
      return {
        ...user,
        isOnline: isActuallyOnline
      }
    })

    return NextResponse.json({ users: usersWithCorrectStatus })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
