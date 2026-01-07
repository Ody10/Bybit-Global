export const dynamic = 'force-static';
export const revalidate = false;

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Helper to verify JWT and get user ID
async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

// GET /api/notifications - Fetch user's notifications
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const whereClause: any = { userId };
    if (unreadOnly) {
      whereClause.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    // Parse metadata JSON for each notification
    const formattedNotifications = notifications.map(n => ({
      ...n,
      metadata: n.metadata ? JSON.parse(n.metadata) : null,
    }));

    return NextResponse.json({
      notifications: formattedNotifications,
      total,
      unreadCount,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create a new notification (internal use)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      userId,
      type,
      category = 'TRANSACTION',
      title,
      message,
      transactionId,
      txHash,
      token,
      amount,
      chain,
      address,
      priority = 'NORMAL',
      metadata,
      internalSecret,
    } = body;

    // Verify internal secret for server-to-server calls
    const expectedSecret = process.env.INTERNAL_API_SECRET || 'internal-secret';
    if (internalSecret !== expectedSecret) {
      // If no internal secret, check for user auth
      const authUserId = await getUserIdFromToken(request);
      if (!authUserId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, type, title, message' },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        category,
        title,
        message,
        transactionId,
        txHash,
        token,
        amount,
        chain,
        address,
        priority,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    return NextResponse.json({
      success: true,
      notification: {
        ...notification,
        metadata: notification.metadata ? JSON.parse(notification.metadata) : null,
      },
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
