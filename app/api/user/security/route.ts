// app/api/user/security/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get user ID from header (for testing) or from auth token
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user data
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        phoneNumber: true,
        lastLoginAt: true,
        googleAuthEnabled: true,
        fundPassword: true,
        antiPhishingCode: true,
      }
    });

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get last login info from LoginHistory
    const lastLogin = await prisma.loginHistory.findFirst({
      where: { 
        userId,
        status: 'SUCCESS'
      },
      orderBy: { createdAt: 'desc' },
      select: {
        createdAt: true,
        deviceInfo: true,
        userAgent: true,
      }
    });

    // Determine device type from userAgent
    let deviceType = 'Unknown';
    if (lastLogin?.userAgent) {
      const ua = lastLogin.userAgent.toLowerCase();
      if (ua.includes('android')) deviceType = 'android';
      else if (ua.includes('iphone') || ua.includes('ipad')) deviceType = 'ios';
      else if (ua.includes('windows')) deviceType = 'windows';
      else if (ua.includes('mac')) deviceType = 'mac';
      else if (ua.includes('linux')) deviceType = 'linux';
    }

    // If deviceInfo is stored, use it (it takes priority)
    if (lastLogin?.deviceInfo) {
      deviceType = lastLogin.deviceInfo;
    }

    // Calculate security level based on enabled features
    let securityScore = 0;
    if (userData.email) securityScore++;
    if (userData.phoneNumber) securityScore++;
    if (userData.googleAuthEnabled) securityScore++;
    if (userData.fundPassword) securityScore++;
    if (userData.antiPhishingCode) securityScore++;

    let securityLevel: 'Low' | 'Medium' | 'High' = 'Low';
    if (securityScore >= 4) securityLevel = 'High';
    else if (securityScore >= 2) securityLevel = 'Medium';

    // Format last login time to match the format in the image (YYYY-MM-DD HH:MM:SS)
    const lastLoginTime = lastLogin?.createdAt 
      ? new Date(lastLogin.createdAt).toLocaleString('en-CA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).replace(',', '')
      : null;

    const securityData = {
      email: userData.email || '******@****',
      phoneNumber: userData.phoneNumber || null,
      lastLoginAt: lastLoginTime,
      lastLoginDevice: deviceType,
      googleAuthEnabled: userData.googleAuthEnabled,
      fundPasswordSet: !!userData.fundPassword,
      antiPhishingCodeSet: !!userData.antiPhishingCode,
      securityLevel
    };

    return NextResponse.json(securityData);
  } catch (error: any) {
    console.error('Security data fetch error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}