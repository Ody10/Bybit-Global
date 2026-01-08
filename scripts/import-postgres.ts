// scripts/import-postgres.ts - FIXED VERSION
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function importData() {
  console.log('🔄 Importing data to PostgreSQL...');
  
  try {
    const data = JSON.parse(fs.readFileSync('sqlite-backup.json', 'utf-8'));

    for (const userData of data.users) {
      const { wallets, userBalances, ...user } = userData;

      try {
        // Create user first
        const createdUser = await prisma.user.create({
          data: user,
        });

        console.log(`✅ Created user: ${user.email}`);

        // Create wallets separately
        if (wallets && wallets.length > 0) {
          for (const wallet of wallets) {
            const { userId, ...walletData } = wallet;
            await prisma.wallet.create({
              data: {
                ...walletData,
                user: { connect: { id: createdUser.id } },
              },
            });
          }
          console.log(`  ✅ Imported ${wallets.length} wallets`);
        }

        // Create user balances separately
        if (userBalances && userBalances.length > 0) {
          for (const balance of userBalances) {
            const { userId, ...balanceData } = balance;
            await prisma.userBalance.create({
              data: {
                ...balanceData,
                user: { connect: { id: createdUser.id } },
              },
            });
          }
          console.log(`  ✅ Imported ${userBalances.length} balances`);
        }

      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`⚠️  User ${user.email} already exists, skipping...`);
        } else {
          console.error(`❌ Failed to import ${user.email}:`, error.message);
        }
      }
    }

    console.log('✅ Import complete!');
  } catch (error) {
    console.error('❌ Import failed:', error);
  }
}

importData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());