export const dynamic = 'force-static';
export const revalidate = false;

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        isEmailVerified: true,
      },
    });

    // Check if user exists
    if (user) {
      return NextResponse.json({
        exists: true,
        isVerified: user.isEmailVerified,
        message: 'Email Already Registered. Please Login',
      });
    }

    // Email not found
    return NextResponse.json({
      exists: false,
      isVerified: false,
      message: 'Email is available',
    });
  } catch (error) {
    console.error('Check email error:', error);
    return NextResponse.json(
      { error: 'An error occurred while checking email' },
      { status: 500 }
    );
  }
}
