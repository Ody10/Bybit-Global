import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, phoneNumber, code, type = 'EMAIL_VERIFICATION' } = await request.json();

    // Validate inputs
    if (!code) {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      );
    }

    if (!email && !phoneNumber) {
      return NextResponse.json(
        { error: 'Email or phone number is required' },
        { status: 400 }
      );
    }

    // Validate code format (must be 6 digits)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'Invalid code format. Code must be 6 digits.' },
        { status: 400 }
      );
    }

    // Find the verification code in database
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        OR: [
          { email: email || undefined },
          { phoneNumber: phoneNumber || undefined },
        ],
        code,
        type,
        used: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Code not found - INVALID CODE
    if (!verificationCode) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (new Date() > verificationCode.expiresAt) {
      // Mark the code as used
      await prisma.verificationCode.update({
        where: { id: verificationCode.id },
        data: { used: true },
      });

      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Code is valid - mark as used
    await prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { used: true },
    });

    // Generate a registration token for the password creation step
    // This token is only valid for 10 minutes
    const registrationToken = Buffer.from(
      JSON.stringify({
        email: email || null,
        phoneNumber: phoneNumber || null,
        verifiedAt: Date.now(),
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
        type,
      })
    ).toString('base64');

    // If user exists, update their verification status
    if (email) {
      await prisma.user.updateMany({
        where: { email },
        data: { isEmailVerified: true },
      });
    }

    if (phoneNumber) {
      await prisma.user.updateMany({
        where: { phoneNumber },
        data: { isPhoneVerified: true },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Code verified successfully',
      verified: true,
      registrationToken,
    });
  } catch (error) {
    console.error('Error verifying code:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}

// Check if a verification code exists and is valid (without consuming it)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const phoneNumber = searchParams.get('phoneNumber');

    if (!email && !phoneNumber) {
      return NextResponse.json(
        { error: 'Email or phone number is required' },
        { status: 400 }
      );
    }

    const verificationRecord = await prisma.verificationCode.findFirst({
      where: {
        OR: [
          { email: email || undefined },
          { phoneNumber: phoneNumber || undefined },
        ],
        used: false,
        expiresAt: {
          gt: new Date(), // Not expired
        },
      },
      select: {
        expiresAt: true,
        createdAt: true,
        type: true,
      },
    });

    if (!verificationRecord) {
      return NextResponse.json({
        exists: false,
        message: 'No active verification code found',
      });
    }

    const remainingSeconds = Math.max(
      0,
      Math.floor((verificationRecord.expiresAt.getTime() - Date.now()) / 1000)
    );

    return NextResponse.json({
      exists: true,
      type: verificationRecord.type,
      expiresAt: verificationRecord.expiresAt.toISOString(),
      remainingSeconds,
    });
  } catch (error) {
    console.error('Error checking verification code:', error);
    return NextResponse.json(
      { error: 'Failed to check verification code' },
      { status: 500 }
    );
  }
}