import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

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

      console.log(`Đã xử lý xong tỉnh/thành: ${p.name}`);
    }

    console.log('\n--- TỔNG KẾT ---');
    console.log(`Tỉnh/Thành phố: ${provinceCount}`);
    console.log(`Quận/Huyện: ${districtCount}`);
    console.log(`Phường/Xã: ${wardCount}`);
    console.log('Hoàn tất chèn dữ liệu!');
  } catch (err) {
    console.error('Có lỗi xảy ra:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
