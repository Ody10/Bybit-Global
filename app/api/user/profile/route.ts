export const dynamic = 'force-static';
export const revalidate = false;

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Helper function to mask email
function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (name.length <= 3) {
    return `${name[0]}***@****`;
  }
  return `${name.slice(0, 3)}***@****`;
}

// Helper function to mask phone
function maskPhone(phone: string | null): string | null {
  if (!phone) return null;
  if (phone.length <= 4) return '****';
  return `${phone.slice(0, 2)}****${phone.slice(-2)}`;
}

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        wallets: true,
        userBalances: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate security level based on enabled features
    let securityLevel = 0;
    let securityFeatures = [];
    
    if (user.isEmailVerified) {
      securityLevel++;
      securityFeatures.push('email');
    }
    if (user.isPhoneVerified) {
      securityLevel++;
      securityFeatures.push('phone');
    }
    if (user.googleAuthEnabled) {
      securityLevel++;
      securityFeatures.push('2fa');
    }
    if (user.fundPassword) {
      securityLevel++;
      securityFeatures.push('fundPassword');
    }

    // Determine security status text
    let securityStatus = 'Low';
    if (securityLevel >= 3) securityStatus = 'High';
    else if (securityLevel >= 2) securityStatus = 'Medium';

    // Return user profile data
    return NextResponse.json({
      success: true,
      user: {
        uid: user.id,
        email: user.email,
        emailMasked: maskEmail(user.email),
        phoneNumber: user.phoneNumber,
        phoneNumberMasked: maskPhone(user.phoneNumber),
        name: user.name,
        avatar: user.avatar,
        country: user.country,
        
        // Verification status
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        
        // KYC
        kycStatus: user.kycStatus,
        kycLevel: user.kycLevel,
        
        // Security
        securityLevel,
        securityStatus,
        securityFeatures,
        twoFactorEnabled: user.twoFactorEnabled,
        googleAuthEnabled: user.googleAuthEnabled,
        hasFundPassword: !!user.fundPassword,
        
        // Account info
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        
        // Stats
        walletCount: user.wallets.length,
        balanceCount: user.userBalances.length,
      },
    });
  } catch (error) {
    console.error('Profile API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
