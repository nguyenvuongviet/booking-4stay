import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as mysql from 'mysql2/promise';
import * as path from 'path';

const prisma = new PrismaClient();

/**
 * Hỗ trợ đợi database sẵn sàng (retry 5 lần) - Đã cấu hình thêm SSL cho Cloud DBs
 */
async function waitForDatabase(
  dbUrl: string,
  retries = 5,
): Promise<mysql.Connection | null> {
  const connectionConfig: any = { uri: dbUrl };

  if (
    dbUrl.includes('sslaccept=') ||
    dbUrl.includes('ssl=') ||
    dbUrl.includes('tidb') ||
    dbUrl.includes('aiven')
  ) {
    connectionConfig.ssl = { minVersion: 'TLSv1.2', rejectUnauthorized: false };
  }

  for (let i = 0; i < retries; i++) {
    try {
      const conn = await mysql.createConnection(connectionConfig);
      return conn;
    } catch (err: any) {
      console.log(
        `[!] Đang đợi database sẵn sàng... (Lần thử ${i + 1}/${retries}). Lỗi: ${err.message}`,
      );
      await new Promise((res) => setTimeout(res, 2000));
    }
  }
  return null;
}

/**
 * Thực thi SQL file sử dụng mysql2 (hỗ trợ DDL như CREATE TRIGGER/PROCEDURE)
 */
async function executeSqlFileWithMysql2(filePath: string) {
  if (!fs.existsSync(filePath)) {
    console.warn(`[!] Bỏ qua: Không tìm thấy file ${path.basename(filePath)}`);
    return;
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error('DATABASE_URL không tồn tại trong môi trường.');

  const connectionConfig: any = {
    uri: dbUrl,
    multipleStatements: true,
  };

  if (
    dbUrl.includes('sslaccept=') ||
    dbUrl.includes('ssl=') ||
    dbUrl.includes('tidb') ||
    dbUrl.includes('aiven')
  ) {
    connectionConfig.ssl = { minVersion: 'TLSv1.2', rejectUnauthorized: false };
  }

  const connection = await mysql.createConnection(connectionConfig);

  try {
    const sql = fs.readFileSync(filePath, 'utf-8');
    const cleanSql = sql
      .replace(/DELIMITER\s+\$\$/g, '')
      .replace(/DELIMITER\s+;/g, '')
      .replace(/\$\$/g, ';');

    await connection.query(cleanSql);
    console.log(`[+] Hoàn tất ${path.basename(filePath)} thành công.`);
  } catch (err: any) {
    if (err.message.includes('Duplicate entry')) {
      console.log(
        `[!] ${path.basename(filePath)}: Đã có dữ liệu, bỏ qua các bản ghi trùng.`,
      );
    } else {
      console.error(
        `[X] Lỗi thực thi ${path.basename(filePath)}:`,
        err.message,
      );
    }
  } finally {
    await connection.end();
  }
}

async function main() {
  const dbUrl = process.env.DATABASE_URL || '';
  console.log('-------------------------------------------------------');
  console.log(' KHỞI ĐỘNG HỆ THỐNG SEEDING TỐI ƯU ');
  console.log('-------------------------------------------------------');

  const start = Date.now();

  try {
    // Kiểm tra kết nối trước
    const conn = await waitForDatabase(dbUrl);
    if (!conn)
      throw new Error('Không thể kết nối đến Database sau nhiều lần thử.');
    await conn.end();

    // Bước 1: App Configs
    console.log('\n Bước 1: Miệt mài nạp Cấu hình App...');
    execSync('npx ts-node src/scripts/seed-configs.ts', { stdio: 'inherit' });

    // Bước 2: Triggers & Procedures
    const isTiDB =
      dbUrl.includes('tidb') || process.env.SKIP_TRIGGERS === 'true';
    if (isTiDB) {
      console.log(
        '\n Bước 2: Phát hiện database TiDB (hoặc SKIP_TRIGGERS=true). Tự động bỏ qua thiết lập Triggers & Procedures SQL (đã được chuyển lên tầng NestJS Services)...',
      );
    } else {
      console.log('\n Bước 2: Thiết lập Triggers & Procedures...');
      await executeSqlFileWithMysql2(
        path.join(__dirname, '../../db/db_trigger.sql'),
      );
    }

    // Bước 3: Locations API
    console.log('\n Bước 3: Đồng bộ 63 tỉnh thành Việt Nam (API)...');
    execSync('npx ts-node src/scripts/seed-locations.ts', { stdio: 'inherit' });

    // Bước 4: Dữ liệu mẫu (Inserts)
    console.log('\n Bước 4: Đang nạp dữ liệu mẫu Insert...');
    await executeSqlFileWithMysql2(
      path.join(__dirname, '../../db/db_insert.sql'),
    );

    // Bổ sung: Tự động cập nhật fullAddress cho các phòng đã seed (vì TiDB không có trigger)
    console.log('\n Bổ sung: Tự động tính toán và cập nhật fullAddress cho tất cả các phòng...');
    const allRooms = await prisma.rooms.findMany({
      select: {
        id: true,
        street: true,
        wardId: true,
        provinceId: true,
        countryId: true,
      },
    });

    for (const r of allRooms) {
      const parts: string[] = [];
      if (r.street) parts.push(r.street);

      if (r.wardId) {
        const ward = await prisma.location_wards.findUnique({
          where: { id: r.wardId },
          select: { name: true },
        });
        if (ward) parts.push(ward.name);
      }

      if (r.provinceId) {
        const province = await prisma.location_provinces.findUnique({
          where: { id: r.provinceId },
          select: { name: true },
        });
        if (province) parts.push(province.name);
      }

      const countryId = r.countryId || 1;
      const country = await prisma.location_countries.findUnique({
        where: { id: countryId },
        select: { name: true },
      });
      if (country) parts.push(country.name);

      const fullAddress = parts.join(', ');

      await prisma.rooms.update({
        where: { id: r.id },
        data: { fullAddress },
      });
    }
    console.log(`[+] Cập nhật fullAddress thành công cho ${allRooms.length} phòng.`);

    const end = Date.now();
    console.log('\n-------------------------------------------------------');
    console.log(` TẤT CẢ ĐÃ SẴN SÀNG (${((end - start) / 1000).toFixed(2)}s)`);
    console.log('-------------------------------------------------------');
  } catch (error: any) {
    console.error('\n LỖI KHỞI ĐỘNG:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
