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
    console.log(
      '\n Bổ sung: Tự động tính toán và cập nhật fullAddress cho tất cả các phòng...',
    );
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
    console.log(
      `[+] Cập nhật fullAddress thành công cho ${allRooms.length} phòng.`,
    );

    // Bổ sung: Tự động tính toán và cập nhật rating, reviewCount cho các phòng dựa trên bảng reviews
    console.log(
      '\n Bổ sung: Tự động tính toán và cập nhật rating, reviewCount cho các phòng...',
    );
    const allReviews = await prisma.reviews.findMany({
      where: { isDeleted: false },
      include: {
        bookings: {
          select: { roomId: true },
        },
      },
    });

    const roomReviewsMap = new Map<
      number,
      { ratingsSum: number; count: number }
    >();
    for (const r of allReviews) {
      const roomId = r.bookings?.roomId;
      if (!roomId) continue;

      const ratingVal = r.rating ? Number(r.rating) : 0;
      const current = roomReviewsMap.get(roomId) || { ratingsSum: 0, count: 0 };
      current.ratingsSum += ratingVal;
      current.count += 1;
      roomReviewsMap.set(roomId, current);
    }

    for (const [roomId, data] of roomReviewsMap.entries()) {
      const averageRating =
        data.count > 0
          ? Math.round((data.ratingsSum / data.count) * 10) / 10
          : 0;
      await prisma.rooms.update({
        where: { id: roomId },
        data: {
          rating: averageRating,
          reviewCount: data.count,
        },
      });
      console.log(
        `[+] Đã cập nhật Phòng #${roomId}: rating = ${averageRating}, reviewCount = ${data.count}`,
      );
    }

    // Bổ sung: Tự động tính toán User Preferences từ lịch sử đặt phòng (Content-Based Recommendations)
    console.log(
      '\n Bổ sung: Tự động tính toán User Preferences cho gợi ý phòng...',
    );
    const bookingsForPrefs = await prisma.bookings.findMany({
      where: {
        status: { in: ['CHECKED_OUT', 'CONFIRMED', 'CHECKED_IN'] },
        isDeleted: false,
      },
      select: { userId: true },
    });

    const uniqueUserIds = Array.from(
      new Set(bookingsForPrefs.map((b) => b.userId)),
    );

    for (const userId of uniqueUserIds) {
      const bookings = await prisma.bookings.findMany({
        where: {
          userId: userId,
          status: { in: ['CHECKED_OUT', 'CONFIRMED', 'CHECKED_IN'] },
          isDeleted: false,
        },
        include: {
          rooms: {
            include: {
              room_amenities: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      if (!bookings.length) continue;

      const prices = bookings.map((b) => Number(b.totalPrice) || 0);
      const avgPrice = prices.reduce((s, p) => s + p, 0) / prices.length;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      const avgAdults =
        bookings.reduce((s, b) => s + b.adults, 0) / bookings.length;
      const avgChildren =
        bookings.reduce((s, b) => s + (b.children || 0), 0) / bookings.length;

      const provinceCounts: Record<number, number> = {};
      for (const b of bookings) {
        const pid = b.rooms?.provinceId;
        if (pid) provinceCounts[pid] = (provinceCounts[pid] || 0) + 1;
      }
      const favoriteProvinces = Object.entries(provinceCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id]) => Number(id));

      const amenityCounts: Record<number, number> = {};
      for (const b of bookings) {
        for (const ra of b.rooms?.room_amenities || []) {
          amenityCounts[ra.amenityId] = (amenityCounts[ra.amenityId] || 0) + 1;
        }
      }
      const preferredAmenities = Object.entries(amenityCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([id]) => Number(id));

      const ratings = bookings
        .map((b) => Number(b.rooms?.rating) || 0)
        .filter((r) => r > 0);
      const minAcceptRating = ratings.length ? Math.min(...ratings) : 0;

      await prisma.user_preferences.upsert({
        where: { userId: userId },
        create: {
          userId: userId,
          avgPrice,
          minPrice,
          maxPrice,
          avgAdults,
          avgChildren,
          minAcceptRating,
          favoriteProvinces,
          preferredAmenities,
          totalCompletedBookings: bookings.length,
          lastCalculatedAt: new Date(),
        },
        update: {
          avgPrice,
          minPrice,
          maxPrice,
          avgAdults,
          avgChildren,
          minAcceptRating,
          favoriteProvinces,
          preferredAmenities,
          totalCompletedBookings: bookings.length,
          lastCalculatedAt: new Date(),
        },
      });
      console.log(`[+] Đã cập nhật User Preferences cho User #${userId}`);
    }

    // Bổ sung: Tự động tính toán và cập nhật điểm Loyalty (Loyalty Program) dựa trên lịch sử đặt phòng thành công
    console.log(
      '\n Bổ sung: Tự động tính toán và cập nhật Loyalty Program cho tất cả người dùng...',
    );
    const allLevels = await prisma.levels.findMany({
      orderBy: { minPoints: 'asc' },
    });
    const defaultLevel =
      allLevels.find((l) => l.minPoints === 0) || allLevels[0];

    const allUsersForLoyalty = await prisma.users.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    for (const u of allUsersForLoyalty) {
      const checkedOutBookings = await prisma.bookings.findMany({
        where: {
          userId: u.id,
          status: 'CHECKED_OUT',
          isDeleted: false,
        },
      });

      let totalBookings = checkedOutBookings.length;
      let totalNights = 0;
      let points = 0;

      for (const b of checkedOutBookings) {
        const diffTime = Math.abs(
          new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime(),
        );
        const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        totalNights += nights;
        points += Math.round(Number(b.totalPrice) / 1000);
      }

      let levelId = defaultLevel?.id || 1;
      const matchedLevel = [...allLevels]
        .reverse()
        .find((lvl) => points >= lvl.minPoints);
      if (matchedLevel) {
        levelId = matchedLevel.id;
      }

      const existing = await prisma.loyalty_program.findUnique({
        where: { userId: u.id },
      });
      const lastUpgradeDate =
        existing && existing.levelId === levelId && existing.lastUpgradeDate
          ? existing.lastUpgradeDate
          : new Date();

      await prisma.loyalty_program.upsert({
        where: { userId: u.id },
        create: {
          userId: u.id,
          totalBookings,
          totalNights,
          points,
          levelId,
          lastUpgradeDate,
        },
        update: {
          totalBookings,
          totalNights,
          points,
          levelId,
          lastUpgradeDate,
        },
      });
      console.log(
        `[+] Đã cập nhật Loyalty Program cho User #${u.id}: points = ${points}, levelId = ${levelId}, bookings = ${totalBookings}, nights = ${totalNights}`,
      );
    }

    // Bổ sung: Tự động tính toán Popularity Score cho tất cả các phòng
    console.log(
      '\n Bổ sung: Tự động tính toán Popularity Score cho tất cả các phòng...',
    );
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const fortyEightHoursAgo = new Date();
    fortyEightHoursAgo.setDate(fortyEightHoursAgo.getDate() - 2);

    const activeRooms = await prisma.rooms.findMany({
      where: { isDeleted: false },
      select: { id: true, rating: true, reviewCount: true, createdAt: true },
    });

    if (activeRooms.length > 0) {
      const bookings30d = await prisma.bookings.findMany({
        where: {
          status: {
            in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'PARTIALLY_PAID'],
          },
          createdAt: { gte: thirtyDaysAgo },
          isDeleted: false,
        },
        select: { roomId: true },
      });

      const cancellations48h = await prisma.bookings.findMany({
        where: {
          status: { in: ['CANCELLED', 'CANCELLED_BY_ADMIN'] },
          updatedAt: { gte: fortyEightHoursAgo },
          isDeleted: false,
        },
        select: { roomId: true },
      });

      const bookingMap = new Map<number, number>();
      for (const b of bookings30d) {
        bookingMap.set(b.roomId, (bookingMap.get(b.roomId) || 0) + 1);
      }

      const cancelMap = new Map<number, number>();
      for (const c of cancellations48h) {
        cancelMap.set(c.roomId, (cancelMap.get(c.roomId) || 0) + 1);
      }

      const maxBookings =
        bookingMap.size > 0 ? Math.max(1, ...bookingMap.values()) : 1;
      const maxReviews = Math.max(
        1,
        ...activeRooms.map((r) => r.reviewCount ?? 0),
      );
      const maxRating = 5.0;

      for (const room of activeRooms) {
        const rating = Number(room.rating) || 0;
        const reviewCount = room.reviewCount ?? 0;
        const bookingCount30d = bookingMap.get(room.id) || 0;
        const recentCancelCount = cancelMap.get(room.id) || 0;

        const normalizedRating = rating / maxRating;
        const normalizedBookings = bookingCount30d / maxBookings;
        const normalizedReviews = reviewCount / maxReviews;

        const roomAge =
          (Date.now() - new Date(room.createdAt).getTime()) /
          (1000 * 60 * 60 * 24);
        const recencyBoost = roomAge < 14 ? 1.0 : 0;

        const popularityScore =
          0.4 * normalizedRating +
          0.3 * normalizedBookings +
          0.2 * normalizedReviews +
          0.1 * recencyBoost;

        await prisma.room_popularity.upsert({
          where: { roomId: room.id },
          create: {
            roomId: room.id,
            popularityScore,
            bookingCount30d,
            avgRating: rating,
            reviewCount,
            recentCancelCount,
            lastCalculatedAt: new Date(),
          },
          update: {
            popularityScore,
            bookingCount30d,
            avgRating: rating,
            reviewCount,
            recentCancelCount,
            lastCalculatedAt: new Date(),
          },
        });
      }
      console.log(
        `[+] Đã cập nhật Popularity Cache thành công cho ${activeRooms.length} phòng.`,
      );
    }

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
