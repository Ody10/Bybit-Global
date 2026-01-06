// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test user
  const hashedPassword = await bcrypt.hash('Test1234!', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      id: '4000000001',
      email: 'test@example.com',
      password: hashedPassword,
      phoneNumber: '+1234567890',
      name: 'Test User',
      isEmailVerified: true,
      isPhoneVerified: true,
      googleAuthEnabled: false,
      twoFactorEnabled: false,
      antiPhishingCode: null,
      fundPassword: null,
      isActive: true,
      isBanned: false,
      kycStatus: 'NOT_STARTED',
      kycLevel: 0,
      walletIndex: 0,
    }
  });

  console.log('✅ Test user created:', user.email);

  // Create login history entries
  const loginHistories = [
    {
      userId: user.id,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      deviceInfo: 'android',
      location: 'New York, USA',
      method: 'PASSWORD',
      status: 'SUCCESS',
      required2FA: false,
      passed2FA: false,
      createdAt: new Date('2025-12-27T16:49:45Z')
    },
    {
      userId: user.id,
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15',
      deviceInfo: 'ios',
      location: 'Los Angeles, USA',
      method: 'PASSWORD',
      status: 'SUCCESS',
      required2FA: false,
      passed2FA: false,
      createdAt: new Date('2025-12-26T10:30:00Z')
    },
    {
      userId: user.id,
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      deviceInfo: 'windows',
      location: 'Chicago, USA',
      method: 'PASSWORD',
      status: 'FAILED',
      required2FA: false,
      passed2FA: false,
      failReason: 'Incorrect password',
      createdAt: new Date('2025-12-25T08:15:00Z')
    }
  ];

  for (const historyData of loginHistories) {
    await prisma.loginHistory.create({ data: historyData });
  }

  console.log('✅ Login history created');

  // Update user's lastLoginAt
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date('2025-12-27T16:49:45Z') }
  });

  // Create a session for the user
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      token: 'test_token_123456789',
      expiresAt,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Linux; Android 13)',
      deviceInfo: 'android'
    }
  });

  console.log('✅ Session created:', session.token);

  // Create user balance entries
  const balances = [
    { currency: 'USDT', chain: 'ETH', totalBalance: 1000, available: 800, locked: 200 },
    { currency: 'BTC', chain: 'BTC', totalBalance: 0.5, available: 0.3, locked: 0.2 },
    { currency: 'ETH', chain: 'ETH', totalBalance: 5, available: 4, locked: 1 },
  ];

  for (const balance of balances) {
    await prisma.userBalance.create({
      data: {
        userId: user.id,
        ...balance,
        network: 'mainnet',
        frozen: 0,
        staked: 0,
        earning: 0,
        usdValue: 0
      }
    });
  }

  console.log('✅ User balances created');

  // Create wallet
  await prisma.wallet.create({
    data: {
      userId: user.id,
      chain: 'ETH',
      network: 'mainnet',
      currency: 'ETH',
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      derivationPath: "m/44'/60'/0'/0/0",
      addressIndex: 0,
      balance: 5,
      available: 4,
      locked: 1
    }
  });

  console.log('✅ Wallet created');

  // Create notifications
  const notifications = [
    {
      userId: user.id,
      type: 'SECURITY',
      category: 'SECURITY',
      title: 'Login from new device',
      message: 'We detected a login from a new Android device in New York, USA',
      priority: 'HIGH',
      isRead: false
    },
    {
      userId: user.id,
      type: 'SYSTEM',
      category: 'SYSTEM',
      title: 'Welcome to CryptoExchange',
      message: 'Thank you for joining us! Complete your profile to get started.',
      priority: 'NORMAL',
      isRead: true,
      readAt: new Date()
    }
  ];

  for (const notification of notifications) {
    await prisma.notification.create({ data: notification });
  }

  console.log('✅ Notifications created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📝 Test User Credentials:');
  console.log('   Email: test@example.com');
  console.log('   Password: Test1234!');
  console.log('   User ID: 4000000001');
  console.log('   Session Token: test_token_123456789');
  console.log('\n💡 For testing with x-user-id header:');
  console.log('   x-user-id: 4000000001');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });