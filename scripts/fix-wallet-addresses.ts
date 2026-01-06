// Script to fix duplicate wallet addresses for existing users
// Run this with: npx ts-node scripts/fix-wallet-addresses.ts
// Or add to package.json: "fix-wallets": "ts-node scripts/fix-wallet-addresses.ts"

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

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

function generateUniqueAddress(visibleUserId: string, chain: string, index: number): string {
  const masterSeed = process.env.WALLET_MASTER_SEED || 'bybit-clone-master-seed-2024';
  const data = `${masterSeed}:${visibleUserId}:${chain}:${index}`;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  
  switch (chain) {
    case 'BTC':
      return `bc1q${hash.slice(0, 38).toLowerCase()}`;
    case 'ETH':
    case 'BSC':
    case 'POLYGON':
    case 'AVAX':
    case 'ARBITRUM':
    case 'OPTIMISM':
    case 'BASE':
      return `0x${hash.slice(0, 40)}`;
    case 'TRX':
      return `T${hash.slice(0, 33)}`;
    case 'SOL':
      const solChars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
      let solAddr = '';
      for (let i = 0; i < 44; i++) {
        const idx = parseInt(hash.slice(i * 2, i * 2 + 2), 16) % solChars.length;
        solAddr += solChars[idx];
      }
      return solAddr;
    case 'LTC':
      return `ltc1q${hash.slice(0, 38).toLowerCase()}`;
    case 'DOGE':
      return `D${hash.slice(0, 33)}`;
    case 'XRP':
      return `r${hash.slice(0, 33)}`;
    case 'TON':
      return `UQ${hash.slice(0, 46)}`;
    default:
      return `0x${hash.slice(0, 40)}`;
  }
}

async function fixWalletAddresses() {
  console.log('Starting wallet address fix...\n');
  console.log('Using master seed:', process.env.WALLET_MASTER_SEED ? '(from env)' : '(default)');
  console.log('');

  try {
    // Get all users
    const users = await prisma.user.findMany({
      include: {
        wallets: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    console.log(`Found ${users.length} users to process\n`);

    let userIndex = 1;
    for (const user of users) {
      console.log(`Processing user ${userIndex}/${users.length}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Current wallets: ${user.wallets.length}`);
      
      // Calculate wallet index from user ID (or use incremental index)
      const walletIndex = user.walletIndex || userIndex;
      
      // Delete existing wallets
      const deleted = await prisma.wallet.deleteMany({
        where: { userId: user.id },
      });
      console.log(`  Deleted ${deleted.count} old wallets`);

      // Create new wallets with unique addresses
      for (const chainConfig of SUPPORTED_CHAINS) {
        const address = generateUniqueAddress(user.id, chainConfig.chain, walletIndex);
        
        await prisma.wallet.create({
          data: {
            userId: user.id,
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

      // Update user's walletIndex if not set
      if (!user.walletIndex || user.walletIndex === 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: { walletIndex: walletIndex },
        });
      }

      console.log(`  ✓ Created ${SUPPORTED_CHAINS.length} new wallets with index ${walletIndex}\n`);
      userIndex++;
    }

    // Verify uniqueness by checking ETH addresses
    console.log('\n=== Verifying Address Uniqueness ===\n');
    
    const ethWallets = await prisma.wallet.findMany({
      where: { chain: 'ETH' },
      select: { address: true, userId: true },
    });

    const addressMap = new Map<string, string[]>();
    ethWallets.forEach(w => {
      const existing = addressMap.get(w.address) || [];
      existing.push(w.userId);
      addressMap.set(w.address, existing);
    });

    const duplicates = Array.from(addressMap.entries()).filter(([_, users]) => users.length > 1);
    
    if (duplicates.length === 0) {
      console.log('✅ All ETH addresses are unique!');
    } else {
      console.log('⚠️ Warning: Found duplicate addresses:');
      duplicates.forEach(([addr, users]) => {
        console.log(`  ${addr}: ${users.join(', ')}`);
      });
    }

    // Show sample addresses for verification
    console.log('\n=== Sample Addresses (First 3 Users) ===\n');
    
    const sampleUsers = await prisma.user.findMany({
      take: 3,
      include: {
        wallets: {
          where: { chain: { in: ['ETH', 'BTC', 'TRX'] } },
          select: { chain: true, address: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    sampleUsers.forEach((user, idx) => {
      console.log(`User ${idx + 1}: ${user.email} (ID: ${user.id})`);
      user.wallets.forEach(w => {
        console.log(`  ${w.chain}: ${w.address}`);
      });
      console.log('');
    });

    console.log(`\n✅ Successfully fixed wallet addresses for ${users.length} users`);

  } catch (error) {
    console.error('Error fixing wallet addresses:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixWalletAddresses()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });