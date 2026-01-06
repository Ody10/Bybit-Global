// app/api/user/change-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Get user ID from header (for testing) or from auth token
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { oldPassword, newPassword } = body;

    // Validation
    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Old password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Additional password strength validation
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return NextResponse.json(
        { error: 'Password must contain uppercase, lowercase, and numbers' },
        { status: 400 }
      );
    }

    // Get user with current password
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
        email: true
      }
    });

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, userData.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Check if new password is same as old password
    const isSamePassword = await bcrypt.compare(newPassword, userData.password);
    if (isSamePassword) {
      return NextResponse.json(
        { error: 'New password cannot be the same as old password' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { 
        password: hashedPassword,
        updatedAt: new Date()
      }
    });

    // Record password change in login history
    await prisma.loginHistory.create({
      data: {
        userId: userData.id,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown',
        userAgent: request.headers.get('user-agent') || null,
        method: 'PASSWORD',
        status: 'SUCCESS',
      }
    });

    // Create notification for password change
    await prisma.notification.create({
      data: {
        userId: userData.id,
        type: 'SECURITY',
        category: 'SECURITY',
        title: 'Password Changed',
        message: 'Your password has been changed successfully. If this wasn\'t you, please contact support immediately.',
        priority: 'HIGH'
      }
    });

    // Optional: Invalidate all existing sessions except current one
    await prisma.session.deleteMany({
      where: { userId }
    });

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully. For security, please log in again with your new password.'
    });

  } catch (error: any) {
    console.error('Password change error:', error);
    
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}