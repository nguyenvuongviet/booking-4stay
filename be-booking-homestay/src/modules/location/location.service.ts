import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { CreateDistrictDto } from './dto/create-district.dto';
import { CreateProvinceDto } from './dto/create-province.dto';
import { CreateWardDto } from './dto/create-ward.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // SEARCH PROVINCE
  async searchProvinces(keyword: string) {
    if (!keyword?.trim())
      throw new BadRequestException('Thiếu từ khóa tìm kiếm');

    const provinces = await this.prisma.location_provinces.findMany({
      where: {
        isDeleted: false,
        name: { contains: keyword.trim() },
      },
      take: 10,
      orderBy: { name: 'asc' },
      select: { id: true, name: true, code: true, imageUrl: true },
    });

    if (!provinces.length)
      throw new NotFoundException('Không tìm thấy tỉnh/thành phù hợp');

    return {
      message: 'Tìm kiếm tỉnh/thành công',
      keyword,
      total: provinces.length,
      items: provinces,
    };
  }

  //  COUNTRY
  async getCountries() {
    const items = await this.prisma.location_countries.findMany({
      orderBy: { name: 'asc' },
    });
    return { message: 'Danh sách quốc gia', total: items.length, items };
  }

  async createCountry(dto: CreateCountryDto) {
    const exists = await this.prisma.location_countries.findFirst({
      where: { name: dto.name },
    });
    if (exists) throw new BadRequestException('Quốc gia đã tồn tại');
    const created = await this.prisma.location_countries.create({ data: dto });
    return { message: 'Tạo quốc gia thành công', data: created };
  }

  //  PROVINCE
  async getProvinces(countryId?: number, search?: string) {
    const where: any = { isDeleted: false };
    if (countryId) where.countryId = countryId;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const items = await this.prisma.location_provinces.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        code: true,
        imageUrl: true,
        countryId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { message: 'Danh sách tỉnh/thành công', total: items.length, items };
  }

  async createProvince(dto: CreateProvinceDto) {
    const country = await this.prisma.location_countries.findUnique({
      where: { id: dto.countryId },
    });
    if (!country)
      throw new NotFoundException('Không tìm thấy quốc gia tương ứng');

    const exists = await this.prisma.location_provinces.findFirst({
      where: { name: dto.name, isDeleted: false },
    });
    if (exists)
      throw new BadRequestException(`Tỉnh/thành "${dto.name}" đã tồn tại`);

    const created = await this.prisma.location_provinces.create({
      data: {
        name: dto.name,
        code: dto.code ?? null,
        countryId: dto.countryId,
        imageUrl: null,
      },
    });
    return { message: 'Tạo tỉnh/thành công', data: created };
  }

  async setProvinceImage(province: string, file: Express.Multer.File) {
    if (!province?.trim())
      throw new BadRequestException('Thiếu tên tỉnh/thành');
    if (!file) throw new BadRequestException('Không có file upload');

    const normalized = province.trim();
    const one = await this.prisma.location_provinces.findFirst({
      where: { name: normalized, isDeleted: false },
      select: { id: true, imageUrl: true },
    });
    if (!one)
      throw new NotFoundException(`Không tìm thấy tỉnh "${normalized}"`);

    const uploadRes: any = await this.cloudinary.uploadImage(
      file.buffer,
      `provinces/${normalized}`,
    );

    await this.prisma.location_provinces.update({
      where: { id: one.id },
      data: { imageUrl: uploadRes.public_id, updatedAt: new Date() },
    });

    if (one.imageUrl) {
      this.cloudinary.deleteImage(one.imageUrl).catch(() => null);
    }

    return {
      message: 'Cập nhật ảnh province thành công',
      province: normalized,
      imageUrl: uploadRes.secure_url,
    };
  }

  async deleteProvinceImage(province: string) {
    if (!province?.trim())
      throw new BadRequestException('Thiếu tên tỉnh/thành');
    const normalized = province.trim();

    const one = await this.prisma.location_provinces.findFirst({
      where: { name: normalized, isDeleted: false },
      select: { id: true, imageUrl: true },
    });
    if (!one)
      throw new NotFoundException(`Không tìm thấy tỉnh "${normalized}"`);

    if (!one.imageUrl)
      return { message: 'Tỉnh/thành chưa có ảnh', province: normalized };

    await this.cloudinary.deleteImage(one.imageUrl).catch(() => null);
    await this.prisma.location_provinces.update({
      where: { id: one.id },
      data: { imageUrl: null, updatedAt: new Date() },
    });

    return { message: 'Xóa ảnh province thành công', province: normalized };
  }

  //  DISTRICT
  async getDistricts(provinceId: number) {
    if (!provinceId) throw new BadRequestException('Thiếu provinceId');
    const items = await this.prisma.location_districts.findMany({
      where: { provinceId, isDeleted: false },
      orderBy: { name: 'asc' },
    });
    return { message: 'Danh sách quận/huyện', total: items.length, items };
  }

  async createDistrict(dto: CreateDistrictDto) {
    const province = await this.prisma.location_provinces.findUnique({
      where: { id: dto.provinceId },
    });
    if (!province || province.isDeleted)
      throw new NotFoundException('Không tìm thấy tỉnh/thành');

    const created = await this.prisma.location_districts.create({ data: dto });
    return { message: 'Tạo quận/huyện thành công', data: created };
  }

  //  WARD
  async getWards(districtId: number) {
    if (!districtId) throw new BadRequestException('Thiếu districtId');
    const items = await this.prisma.location_wards.findMany({
      where: { districtId, isDeleted: false },
      orderBy: { name: 'asc' },
    });
    return { message: 'Danh sách phường/xã', total: items.length, items };
  }

  async createWard(dto: CreateWardDto) {
    const district = await this.prisma.location_districts.findUnique({
      where: { id: dto.districtId },
    });
    if (!district || district.isDeleted)
      throw new NotFoundException('Không tìm thấy quận/huyện');
    const created = await this.prisma.location_wards.create({ data: dto });
    return { message: 'Tạo phường/xã thành công', data: created };
  }

  // UPDATE + DELETE
  async updateLocation(type: string, id: number, dto: UpdateLocationDto) {
    let updated: any;

    switch (type) {
      case 'country': {
        const existing = await this.prisma.location_countries.findUnique({
          where: { id },
        });
        if (!existing) throw new NotFoundException('Không tìm thấy quốc gia');
        updated = await this.prisma.location_countries.update({
          where: { id },
          data: dto,
        });
        break;
      }
      case 'province': {
        const existing = await this.prisma.location_provinces.findUnique({
          where: { id },
        });
        if (!existing) throw new NotFoundException('Không tìm thấy tỉnh/thành');
        updated = await this.prisma.location_provinces.update({
          where: { id },
          data: dto,
        });
        break;
      }
      case 'district': {
        const existing = await this.prisma.location_districts.findUnique({
          where: { id },
        });
        if (!existing) throw new NotFoundException('Không tìm thấy quận/huyện');
        updated = await this.prisma.location_districts.update({
          where: { id },
          data: dto,
        });
        break;
      }
      case 'ward': {
        const existing = await this.prisma.location_wards.findUnique({
          where: { id },
        });
        if (!existing) throw new NotFoundException('Không tìm thấy phường/xã');
        updated = await this.prisma.location_wards.update({
          where: { id },
          data: dto,
        });
        break;
      }
      default:
        throw new BadRequestException('Loại location không hợp lệ');
    }

    return { message: `Cập nhật ${type} thành công`, data: updated };
  }

  async deleteLocation(type: string, id: number) {
    let deleted: any;

    switch (type) {
      case 'country': {
        const existing = await this.prisma.location_countries.findUnique({
          where: { id },
        });
        if (!existing) throw new NotFoundException('Không tìm thấy quốc gia');
        deleted = await this.prisma.location_countries.delete({
          where: { id },
        });
        break;
      }
      case 'province': {
        const existing = await this.prisma.location_provinces.findUnique({
          where: { id },
        });
        if (!existing) throw new NotFoundException('Không tìm thấy tỉnh/thành');
        deleted = await this.prisma.location_provinces.update({
          where: { id },
          data: { isDeleted: true, deletedAt: new Date() },
        });
        break;
      }
      case 'district': {
        const existing = await this.prisma.location_districts.findUnique({
          where: { id },
        });
        if (!existing) throw new NotFoundException('Không tìm thấy quận/huyện');
        deleted = await this.prisma.location_districts.update({
          where: { id },
          data: { isDeleted: true, deletedAt: new Date() },
        });
        break;
      }
      case 'ward': {
        const existing = await this.prisma.location_wards.findUnique({
          where: { id },
        });
        if (!existing) throw new NotFoundException('Không tìm thấy phường/xã');
        deleted = await this.prisma.location_wards.update({
          where: { id },
          data: { isDeleted: true, deletedAt: new Date() },
        });
        break;
      }
      default:
        throw new BadRequestException('Loại location không hợp lệ');
    }

    return { message: `Xóa ${type} thành công`, data: deleted };
  }

  // IMPORT CSV
  async importFromFile(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Không có file upload');
    if (!file.buffer) throw new BadRequestException('File rỗng');

    const rows: any[] = [];

    // Đọc file CSV
    const stream = Readable.from(file.buffer);
    await new Promise<void>((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on('data', (row) => rows.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    if (!rows.length)
      throw new BadRequestException('File CSV không có dữ liệu');

    // Counters để thống kê
    const count = {
      countries: 0,
      provinces: 0,
      districts: 0,
      wards: 0,
    };

    // Duyệt từng dòng CSV
    for (const row of rows) {
      const countryCode = row.countryCode?.trim();
      const countryName = row.countryName?.trim();
      const provinceName = row.province?.trim();
      const districtName = row.district?.trim();
      const wardName = row.ward?.trim();

      if (!countryCode || !countryName) continue;

      // --- COUNTRY ---
      let country = await this.prisma.location_countries.findUnique({
        where: { code: countryCode },
      });

      if (!country) {
        country = await this.prisma.location_countries.create({
          data: {
            code: countryCode,
            name: countryName,
          },
        });
        count.countries++;
      }

      // --- PROVINCE ---
      let province: any = null;
      if (provinceName) {
        province = await this.prisma.location_provinces.findFirst({
          where: { name: provinceName, countryId: country.id },
        });

        if (!province) {
          province = await this.prisma.location_provinces.create({
            data: {
              name: provinceName,
              code: provinceName.slice(0, 3).toUpperCase(),
              countryId: country.id,
            },
          });
          count.provinces++;
        }
      }

      // --- DISTRICT ---
      let district: any = null;
      if (province && districtName) {
        district = await this.prisma.location_districts.findFirst({
          where: { name: districtName, provinceId: province.id },
        });

        if (!district) {
          district = await this.prisma.location_districts.create({
            data: {
              name: districtName,
              code: districtName.slice(0, 3).toUpperCase(),
              provinceId: province.id,
            },
          });
          count.districts++;
        }
      }

      // --- WARD ---
      if (district && wardName) {
        const existingWard = await this.prisma.location_wards.findFirst({
          where: { name: wardName, districtId: district.id },
        });

        if (!existingWard) {
          await this.prisma.location_wards.create({
            data: {
              name: wardName,
              code: wardName.slice(0, 3).toUpperCase(),
              districtId: district.id,
            },
          });
          count.wards++;
        }
      }
    }

    return {
      message: 'Import dữ liệu location thành công',
      totalRows: rows.length,
      summary: count,
    };
  }
}
