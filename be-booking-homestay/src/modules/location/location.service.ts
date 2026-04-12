import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { sanitizeLocation } from 'src/utils/sanitize/location.sanitize';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { CreateDistrictDto } from './dto/create-district.dto';
import { CreateProvinceDto } from './dto/create-province.dto';
import { CreateWardDto } from './dto/create-ward.dto';
import { LocationQueryDto } from './dto/location-query.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async searchProvinces(keyword?: string) {
    const where: any = { isDeleted: false };

    if (keyword?.trim()) {
      where.name = { contains: keyword.trim() };
    }

    const provinces = await this.prisma.location_provinces.findMany({
      where,
      orderBy: { name: 'asc' },
      take: keyword ? 10 : undefined,
      select: {
        id: true,
        name: true,
        code: true,
        imageUrl: true,
        countryId: true,
      },
    });

    return {
      status: 'Success',
      code: 200,
      message: keyword?.trim()
        ? 'Tìm kiếm tỉnh/thành công'
        : 'Danh sách tất cả tỉnh/thành',
      keyword: keyword?.trim() || null,
      total: provinces.length,
      data: sanitizeLocation(provinces),
    };
  }

  async getCountries(query: LocationQueryDto) {
    const { page, pageSize, search } = query;
    const skip = (page - 1) * pageSize;
    const where: any = {};

    if (search?.trim()) {
      where.name = { contains: search.trim() };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.location_countries.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: pageSize,
      }),
      this.prisma.location_countries.count({ where }),
    ]);

    return {
      message: 'Danh sách quốc gia',
      items: sanitizeLocation(items),
      meta: {
        totalItems: total,
        itemsPerPage: pageSize,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
      },
    };
  }

  async createCountry(dto: CreateCountryDto) {
    const exists = await this.prisma.location_countries.findFirst({
      where: { name: dto.name },
    });
    if (exists) throw new BadRequestException('Quốc gia đã tồn tại');
    const created = await this.prisma.location_countries.create({ data: dto });
    return { message: 'Tạo quốc gia thành công', data: created };
  }

  async getProvinces(query: LocationQueryDto) {
    const { page, pageSize, search, countryId } = query;
    const skip = (page - 1) * pageSize;
    const where: any = { isDeleted: false };

    if (countryId) where.countryId = countryId;
    if (search?.trim()) {
      where.name = { contains: search.trim() };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.location_provinces.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          name: true,
          code: true,
          imageUrl: true,
          countryId: true,
          latitude: true,
          longitude: true,
          createdAt: true,
          updatedAt: true,
          location_countries: true,
        },
      }),
      this.prisma.location_provinces.count({ where }),
    ]);

    return {
      message: 'Danh sách tỉnh/thành công',
      items: sanitizeLocation(items),
      meta: {
        totalItems: total,
        itemsPerPage: pageSize,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
      },
    };
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
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
        imageUrl: null,
      },
    });
    return { message: 'Tạo tỉnh/thành công', data: created };
  }

  async setProvinceImage(provinceId: number, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Không có file upload');
    const one = await this.prisma.location_provinces.findUnique({
      where: { id: provinceId, isDeleted: false },
      select: { name: true, id: true, imageUrl: true },
    });
    if (!one)
      throw new NotFoundException(`Không tìm thấy tỉnh với ID: ${provinceId}`);
    const normalizedName = one.name;
    const uploadRes: any = await this.cloudinary.uploadImage(
      file.buffer,
      `provinces/${normalizedName}`,
    );
    await this.prisma.location_provinces.update({
      where: { id: provinceId },
      data: { imageUrl: uploadRes.public_id, updatedAt: new Date() },
    });
    if (one.imageUrl)
      this.cloudinary.deleteImage(one.imageUrl).catch(() => null);
    return {
      message: 'Cập nhật ảnh province thành công',
      provinceId: provinceId,
      provinceName: normalizedName,
      imageUrl: uploadRes.secure_url,
    };
  }

  async deleteProvinceImage(provinceId: number) {
    if (isNaN(provinceId)) throw new BadRequestException('ID không hợp lệ');
    const one = await this.prisma.location_provinces.findUnique({
      where: { id: provinceId, isDeleted: false },
      select: { id: true, imageUrl: true, name: true },
    });
    if (!one)
      throw new NotFoundException(`Không tìm thấy tỉnh với ID: ${provinceId}`);

    if (!one.imageUrl) {
      return {
        message: 'Tỉnh/thành chưa có ảnh',
        provinceId: provinceId,
        provinceName: one.name,
      };
    }
    await this.cloudinary.deleteImage(one.imageUrl).catch(() => null);
    await this.prisma.location_provinces.update({
      where: { id: one.id },
      data: { imageUrl: null, updatedAt: new Date() },
    });
    return {
      message: 'Xóa ảnh province thành công',
      provinceId: provinceId,
      provinceName: one.name,
    };
  }

  async getDistricts(query: LocationQueryDto) {
    const { page, pageSize, search, provinceId } = query;
    const skip = (page - 1) * pageSize;
    const where: any = { isDeleted: false };

    if (provinceId) where.provinceId = provinceId;
    if (search?.trim()) {
      where.name = { contains: search.trim() };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.location_districts.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: pageSize,
        include: { location_provinces: true },
      }),
      this.prisma.location_districts.count({ where }),
    ]);

    return {
      message: 'Danh sách quận/huyện',
      items: sanitizeLocation(items),
      meta: {
        totalItems: total,
        itemsPerPage: pageSize,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
      },
    };
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

  async getWards(query: LocationQueryDto) {
    const { page, pageSize, search, districtId } = query;
    const skip = (page - 1) * pageSize;
    const where: any = { isDeleted: false };

    if (districtId) where.districtId = districtId;
    if (search?.trim()) {
      where.name = { contains: search.trim() };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.location_wards.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: pageSize,
        include: { location_districts: true },
      }),
      this.prisma.location_wards.count({ where }),
    ]);

    return {
      message: 'Danh sách phường/xã',
      items: sanitizeLocation(items),
      meta: {
        totalItems: total,
        itemsPerPage: pageSize,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
      },
    };
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

  async updateLocation(type: string, id: number, dto: UpdateLocationDto) {
    switch (type) {
      case 'country': {
        const existing = await this.prisma.location_countries.findUnique({
          where: { id },
        });
        if (!existing) throw new NotFoundException('Không tìm thấy quốc gia');
        const data: any = {};
        if (dto.name !== undefined) data.name = dto.name;
        if (dto.code !== undefined) data.code = dto.code.toUpperCase();
        const updated = await this.prisma.location_countries.update({
          where: { id },
          data,
        });
        return { message: 'Cập nhật country thành công', data: updated };
      }
      case 'province': {
        const existing = await this.prisma.location_provinces.findUnique({
          where: { id },
        });
        if (!existing) throw new NotFoundException('Không tìm thấy tỉnh/thành');
        if (dto.countryId !== undefined) {
          const parent = await this.prisma.location_countries.findUnique({
            where: { id: dto.countryId },
          });
          if (!parent) throw new BadRequestException('Country không tồn tại');
        }
        const data: any = {};
        if (dto.name !== undefined) data.name = dto.name;
        if (dto.countryId !== undefined) data.countryId = dto.countryId;
        if (dto.latitude !== undefined) data.latitude = dto.latitude;
        if (dto.longitude !== undefined) data.longitude = dto.longitude;
        const updated = await this.prisma.location_provinces.update({
          where: { id },
          data,
        });
        return { message: 'Cập nhật province thành công', data: updated };
      }
      case 'district': {
        const existing = await this.prisma.location_districts.findUnique({
          where: { id },
        });
        if (!existing) throw new NotFoundException('Không tìm thấy quận/huyện');
        if (dto.provinceId !== undefined) {
          const parent = await this.prisma.location_provinces.findUnique({
            where: { id: dto.provinceId },
          });
          if (!parent) throw new BadRequestException('Province không tồn tại');
        }
        const data: any = {};
        if (dto.name !== undefined) data.name = dto.name;
        if (dto.provinceId !== undefined) data.provinceId = dto.provinceId;
        const updated = await this.prisma.location_districts.update({
          where: { id },
          data,
        });
        return { message: 'Cập nhật district thành công', data: updated };
      }
      case 'ward': {
        const existing = await this.prisma.location_wards.findUnique({
          where: { id },
        });
        if (!existing) throw new NotFoundException('Không tìm thấy phường/xã');
        if (dto.districtId !== undefined) {
          const parent = await this.prisma.location_districts.findUnique({
            where: { id: dto.districtId },
          });
          if (!parent) throw new BadRequestException('District không tồn tại');
        }
        const data: any = {};
        if (dto.name !== undefined) data.name = dto.name;
        if (dto.districtId !== undefined) data.districtId = dto.districtId;
        const updated = await this.prisma.location_wards.update({
          where: { id },
          data,
        });
        return { message: 'Cập nhật ward thành công', data: updated };
      }
      default:
        throw new BadRequestException('Loại location không hợp lệ');
    }
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
}
