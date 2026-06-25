import { PrismaClient } from '@prisma/client';
import { AppConfigKey, AppConfigDefaults } from '../modules/app-configs/constants/app-config.constant';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Đang nạp cấu hình hệ thống ban đầu (Seeding App Configs) ---');

  for (const key of Object.values(AppConfigKey)) {
    const value = AppConfigDefaults[key];
    
    await prisma.app_configs.upsert({
      where: { key },
      update: {
      },
      create: {
        key,
        value,
        description: `Cấu hình mặc định cho ${key}`,
      },
    });
    console.log(`+ Đã nạp: ${key} = ${JSON.stringify(value)}`);
  }

  console.log('--- Hoàn tất Seeding ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
