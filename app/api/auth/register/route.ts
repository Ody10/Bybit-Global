import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Supported chains configuration
const SUPPORTED_CHAINS = [
  { chain: 'BTC', network: 'mainnet', currency: 'BTC' },
  { chain: 'ETH', network: 'mainnet', currency: 'ETH' },
  { chain: 'TRX', network: 'mainnet', currency: 'TRX' },
  { chain: 'BSC', network: 'mainnet', currency: 'BNB' },
  { chain: 'POLYGON', network: 'mainnet', currency: 'MATIC' },
  { chain: 'AVAX', network: 'mainnet', currency: 'AVAX' },
  { chain: 'ARBITRUM', network: 'mainnet', currency: 'ETH' },
  { chain: 'OPTIMISM', network: 'mainnet', currency: 'ETH' },
  { chain: 'BASE', network: 'mainnet', currency: 'ETH' },
  { chain: 'SOL', network: 'mainnet', currency: 'SOL' },
  { chain: 'LTC', network: 'mainnet', currency: 'LTC' },
  { chain: 'DOGE', network: 'mainnet', currency: 'DOGE' },
  { chain: 'XRP', network: 'mainnet', currency: 'XRP' },
  { chain: 'TON', network: 'mainnet', currency: 'TON' },
];

// Generate a unique deterministic address for each user and chain
function generateUniqueAddress(visibleUserId: string, chain: string, index: number): string {
  // Create a deterministic hash based on a master seed + visibleUserId + chain + index
  // Using visibleUserId ensures uniqueness per user
  const masterSeed = process.env.WALLET_MASTER_SEED || 'bybit-clone-master-seed-2024';
  const data = `${masterSeed}:${visibleUserId}:${chain}:${index}`;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  
  switch (chain) {
    case 'BTC':
      // Bitcoin bech32 format (42 chars total)
      return `bc1q${hash.slice(0, 38).toLowerCase()}`;
    
    case 'ETH':
    case 'BSC':
    case 'POLYGON':
    case 'AVAX':
    case 'ARBITRUM':
    case 'OPTIMISM':
    case 'BASE':
      // Ethereum-style address (42 chars with 0x)
      return `0x${hash.slice(0, 40)}`;
    
    case 'TRX':
      // Tron address (34 chars starting with T)
      return `T${hash.slice(0, 33)}`;
    
    case 'SOL':
      // Solana address (44 chars base58-like)
      const solChars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
      let solAddr = '';
      for (let i = 0; i < 44; i++) {
        const idx = parseInt(hash.slice(i * 2, i * 2 + 2), 16) % solChars.length;
        solAddr += solChars[idx];
      }
      return solAddr;
    
    case 'LTC':
      // Litecoin bech32 format
      return `ltc1q${hash.slice(0, 38).toLowerCase()}`;
    
    case 'DOGE':
      // Dogecoin address (34 chars starting with D)
      return `D${hash.slice(0, 33)}`;
    
    case 'XRP':
      // Ripple address (25-35 chars starting with r)
      return `r${hash.slice(0, 33)}`;
    
    case 'TON':
      // TON address
      return `UQ${hash.slice(0, 46)}`;
    
    default:
      return `0x${hash.slice(0, 40)}`;
  }
}

// Get the next unique UID (10-digit starting with 4)
async function getNextUid(): Promise<string> {
  const counter = await prisma.uidCounter.upsert({
    where: { id: 'uid_counter' },
    update: { lastUid: { increment: 1 } },
    create: { id: 'uid_counter', lastUid: BigInt(4000000001) },
  });
  
  return counter.lastUid.toString();
}

// Generate a unique referral code for the user
function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    const { 
      email, 
      password, 
      registrationToken,
      name,
      phoneNumber,
      referralCode,
    } = await request.json();

    // Validate required fields
    if (!email || !password || !registrationToken) {
      return NextResponse.json(
        { error: 'Email, password, and registration token are required' },
        { status: 400 }
      );
    }

    // Validate registration token
    try {
      const tokenData = JSON.parse(Buffer.from(registrationToken, 'base64').toString());
      
      if (tokenData.email !== email) {
        return NextResponse.json(
          { error: 'Invalid registration token' },
          { status: 400 }
        );
      }

      if (Date.now() > tokenData.expiresAt) {
        return NextResponse.json(
          { error: 'Registration token has expired. Please verify your email again.' },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid registration token' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password requirements
    const passwordRequirements = [
      { check: password.length >= 8 && password.length <= 30, message: 'Password must be 8-30 characters' },
      { check: /[a-z]/.test(password), message: 'Password must contain at least one lowercase letter' },
      { check: /[A-Z]/.test(password), message: 'Password must contain at least one uppercase letter' },
      { check: /[0-9]/.test(password), message: 'Password must contain at least one number' },
    ];

    const failedRequirement = passwordRequirements.find(req => !req.check);
    if (failedRequirement) {
      return NextResponse.json(
        { error: failedRequirement.message },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Check if phone number already exists (if provided)
    if (phoneNumber) {
      const existingPhone = await prisma.user.findUnique({
        where: { phoneNumber },
      });

      if (existingPhone) {
        return NextResponse.json(
          { error: 'An account with this phone number already exists' },
          { status: 409 }
        );
      }
    }

    // Get unique UID for this user (10-digit starting with 4)
    const uid = await getNextUid();
    const walletIndex = parseInt(uid.slice(-6)); // Use last 6 digits as wallet index
    
    console.log(`Creating user with UID: ${uid}, wallet index: ${walletIndex}`);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate user's own referral code
    const myReferralCode = generateReferralCode();

    // Create user and wallets in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create the user first with the UID as the primary key
      const newUser = await tx.user.create({
        data: {
          id: uid, // Use UID as the primary key (10-digit)
          name: name || null,
          email,
          phoneNumber: phoneNumber || null,
          password: hashedPassword,
          referralCode: referralCode || null,
          myReferralCode: myReferralCode,
          isEmailVerified: true,
          isPhoneVerified: false,
          walletIndex: walletIndex,
        },
      });

      // Generate and create wallets for all supported chains
      for (const chainConfig of SUPPORTED_CHAINS) {
        // Generate unique address using the UID
        const address = generateUniqueAddress(uid, chainConfig.chain, walletIndex);
        
        await tx.wallet.create({
          data: {
            userId: newUser.id,
            chain: chainConfig.chain,
            network: chainConfig.network,
            currency: chainConfig.currency,
            address: address,
            derivationPath: `m/44'/${walletIndex}'/${chainConfig.chain}'/0/0`,
            addressIndex: walletIndex,
            balance: 0,
            available: 0,
            locked: 0,
          },
        });
      }

      // Handle referral if code provided
      if (referralCode) {
        const referrer = await tx.user.findFirst({
          where: { myReferralCode: referralCode },
        });

        if (referrer) {
          await tx.referral.create({
            data: {
              referrerId: referrer.id,
              referredUserId: newUser.id,
              code: referralCode,
              status: 'ACTIVE',
            },
          });
        }
      }

      return newUser;
    });

    // Generate JWT token for auto-login
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    // Get the created wallets
    const wallets = await prisma.wallet.findMany({
      where: { userId: user.id },
      select: {
        chain: true,
        network: true,
        currency: true,
        address: true,
        balance: true,
      },
    });

    console.log(`User ${user.email} (UID: ${user.id}) created with ${wallets.length} wallets`);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        uid: user.id, // Same as id in this schema
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        referralCode: user.referralCode,
        myReferralCode: user.myReferralCode,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        createdAt: user.createdAt,
      },
      wallets,
    });
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        referralCode: true,
        myReferralCode: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        walletIndex: true,
        createdAt: true,
        updatedAt: true,
        wallets: {
          select: {
            chain: true,
            network: true,
            currency: true,
            address: true,
            balance: true,
            addressIndex: true,
          },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}