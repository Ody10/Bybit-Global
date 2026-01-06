// lib/auth.ts
import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

interface JWTPayload {
  userId: string;
  email: string;
}

/**
 * Get current user from request
 * Checks for token in cookies or Authorization header
 */
export async function getCurrentUser(request: NextRequest) {
  try {
    // Try to get token from cookie first
    let token = request.cookies.get('auth_token')?.value;
    
    // If not in cookie, check Authorization header
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    // Check x-user-id header (for development/testing)
    const userIdHeader = request.headers.get('x-user-id');
    if (userIdHeader && !token) {
      const user = await prisma.user.findUnique({
        where: { id: userIdHeader }
      });
      return user;
    }

    if (!token) {
      return null;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // Check if session exists and is valid
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return session.user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

/**
 * Verify user is authenticated
 * Returns user or throws 401 error
 */
export async function requireAuth(request: NextRequest) {
  const user = await getCurrentUser(request);
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

/**
 * Create a new session for user
 */
export async function createSession(userId: string, request: NextRequest) {
  const token = jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const session = await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      userAgent: request.headers.get('user-agent') || null,
    }
  });

  return session;
}

/**
 * Delete user session (logout)
 */
export async function deleteSession(token: string) {
  await prisma.session.delete({
    where: { token }
  });
}

/**
 * Record login attempt
 */
export async function recordLoginAttempt(
  userId: string,
  request: NextRequest,
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED' | '2FA_REQUIRED',
  method: string = 'PASSWORD',
  failReason?: string
) {
  await prisma.loginHistory.create({
    data: {
      userId,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown',
      userAgent: request.headers.get('user-agent') || null,
      method,
      status,
      failReason,
    }
  });

  // Update user's lastLoginAt if successful
  if (status === 'SUCCESS') {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() }
    });
  }
}