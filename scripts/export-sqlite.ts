import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function exportData() {
  console.log('🔄 Exporting SQLite data...');
  
  try {
    const users = await prisma.user.findMany({
      include: {
        wallets: true,
        userBalances: true,
      },
    });

    const data = {
      users,
      exportedAt: new Date().toISOString(),
      count: users.length,
    };

    fs.writeFileSync('sqlite-backup.json', JSON.stringify(data, null, 2));
    console.log(`✅ Exported ${users.length} users to sqlite-backup.json`);
  } catch (error) {
    console.error('❌ Export failed:', error);
  }
}

exportData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());