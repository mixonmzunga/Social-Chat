import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Get a single user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        phone: true,
        bio: true,
        isOnline: true,
        lastSeen: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Users are considered offline if they haven't sent heartbeat in last 30 seconds
    const ONLINE_THRESHOLD = new Date(Date.now() - 30 * 1000)
    const isActuallyOnline = user.isOnline && user.lastSeen && new Date(user.lastSeen) > ONLINE_THRESHOLD

    return NextResponse.json({ 
      user: {
        ...user,
        isOnline: isActuallyOnline
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update a user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, username, phone, avatar, bio } = body

    // Check if username is already taken by another user
    if (username) {
      const existingUser = await db.user.findFirst({
        where: {
          username,
          NOT: { id }
        }
      })
      if (existingUser) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 400 }
        )
      }
    }

    const user = await db.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(username !== undefined && { username }),
        ...(phone !== undefined && { phone }),
        ...(avatar !== undefined && { avatar }),
        ...(bio !== undefined && { bio })
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        phone: true,
        bio: true,
        isOnline: true,
        lastSeen: true
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
