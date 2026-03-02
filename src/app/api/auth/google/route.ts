import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, picture } = body

    // Validate input
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      )
    }

    // Find or create user
    let user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        avatar: true,
        bio: true,
        isOnline: true,
        lastSeen: true,
        password: true
      }
    })

    if (!user) {
      // Create new user for Google OAuth
      user = await db.user.create({
        data: {
          name,
          email,
          avatar: picture || null,
          password: null, // No password for OAuth users
          isOnline: true,
          lastSeen: new Date()
        },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          phone: true,
          avatar: true,
          bio: true,
          isOnline: true,
          lastSeen: true,
          password: true
        }
      })
    } else {
      // Update existing user
      user = await db.user.update({
        where: { id: user.id },
        data: {
          isOnline: true,
          lastSeen: new Date(),
          avatar: picture || user.avatar
        },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          phone: true,
          avatar: true,
          bio: true,
          isOnline: true,
          lastSeen: true,
          password: true
        }
      })
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'Google login successful',
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Google login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
