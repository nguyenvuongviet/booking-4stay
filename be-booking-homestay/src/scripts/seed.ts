import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as mysql from 'mysql2/promise';

const prisma = new PrismaClient();

/**
 * Hàm hỗ trợ đợi database sẵn sàng (retry 5 lần)
 */
async function waitForDatabase(
  dbUrl: string,
  retries = 5,
): Promise<mysql.Connection | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await mysql.createConnection({ uri: dbUrl });
      return conn;
    } catch (err) {
      console.log(
        `[!] Đang đợi database sẵn sàng... (Lần thử ${i + 1}/${retries})`,
      );
      await new Promise((res) => setTimeout(res, 2000));
    }
  }
  return null;
}

/**
 * Hàm thực thi SQL file sử dụng mysql2 (hỗ trợ DDL như CREATE TRIGGER/PROCEDURE)
 */
async function executeSqlFileWithMysql2(filePath: string) {
  if (!fs.existsSync(filePath)) {
    console.warn(`[!] Bỏ qua: Không tìm thấy file ${path.basename(filePath)}`);
    return;
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error('DATABASE_URL không tồn tại trong môi trường.');

  const connection = await mysql.createConnection({
    uri: dbUrl,
    multipleStatements: true,
  });

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
    console.log('\n Bước 2: Thiết lập Triggers & Procedures...');
    await executeSqlFileWithMysql2(
      path.join(__dirname, '../../db/db_trigger.sql'),
    );

    // Bước 3: Locations API
    console.log('\n Bước 3: Đồng bộ 63 tỉnh thành Việt Nam (API)...');
    execSync('npx ts-node src/scripts/seed-locations.ts', { stdio: 'inherit' });

    // Bước 4: Dữ liệu mẫu (Inserts)
    console.log('\n Bước 4: Đang nạp dữ liệu mẫu Insert...');
    await executeSqlFileWithMysql2(
      path.join(__dirname, '../../db/db_insert.sql'),
    );

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
