import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

/** Nominatim public geocoding API (rate limit: 1 req/s) */
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

/** Tôn trọng rate limit 1 req/s của Nominatim */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Lấy tọa độ trung tâm của một tỉnh via Nominatim */
async function geocodeProvince(
  name: string,
): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await axios.get(NOMINATIM_URL, {
      params: { q: `${name}, Việt Nam`, format: 'json', limit: 1 },
      headers: { 'Accept-Language': 'vi', 'User-Agent': '4stay-thesis-app' },
      timeout: 5000,
    });
    const item = res.data?.[0];
    if (!item) return null;
    return { lat: parseFloat(item.lat), lng: parseFloat(item.lon) };
  } catch {
    return null;
  }
}

async function main() {
  console.log('Bắt đầu cập nhật dữ liệu vị trí từ API...');

  try {
    const country = await prisma.location_countries.upsert({
      where: { code: 'VN' },
      update: {},
      create: {
        name: 'Việt Nam',
        code: 'VN',
      },
    });

    console.log(`Đã sẵn sàng quốc gia: ${country.name}`);

    console.log('Đang tải dữ liệu từ open-api.vn...');
    const response = await axios.get(
      'https://provinces.open-api.vn/api/?depth=3',
    );
    const data = response.data;

    let provinceCount = 0;
    let districtCount = 0;
    let wardCount = 0;

    for (const p of data) {
      const province = await prisma.location_provinces.upsert({
        where: { name: p.name },
        update: { code: String(p.code) },
        create: {
          countryId: country.id,
          name: p.name,
          code: String(p.code),
        },
      });

      // Geocode tọa độ nếu chưa có
      if (!province.latitude || !province.longitude) {
        const coords = await geocodeProvince(p.name);
        if (coords) {
          await prisma.location_provinces.update({
            where: { id: province.id },
            data: { latitude: coords.lat, longitude: coords.lng },
          });
        }
        // Tôn trọng rate limit 1 req/s của Nominatim
        await sleep(1100);
      }

      provinceCount++;

      for (const d of p.districts || []) {
        let district = await prisma.location_districts.findUnique({
          where: {
            provinceId_name: {
              provinceId: province.id,
              name: d.name,
            },
          },
        });

        if (!district) {
          district = await prisma.location_districts.create({
            data: {
              provinceId: province.id,
              name: d.name,
              code: String(d.code),
            },
          });
        }
        districtCount++;

        const wardData = (d.wards || []).map((w: any) => ({
          districtId: district.id,
          name: w.name,
          code: String(w.code),
        }));

        if (wardData.length > 0) {
          await prisma.location_wards.createMany({
            data: wardData,
            skipDuplicates: true,
          });
          wardCount += wardData.length;
        }
      }

      console.log(`✓ ${p.name}`);
    }

    console.log('\n--- TỔNG KẾT ---');
    console.log(`Tỉnh/Thành phố: ${provinceCount}`);
    console.log(`Quận/Huyện: ${districtCount}`);
    console.log(`Phường/Xã: ${wardCount}`);
    console.log('Hoàn tất!');
  } catch (err) {
    console.error('Có lỗi xảy ra:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
