import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { buildImageUrl, cleanData } from 'src/utils/object';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class LocationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async findAll() {
    const locations = await this.prisma.locations.findMany({
      where: { isDeleted: false },
      orderBy: [{ province: 'asc' }, { district: 'asc' }, { ward: 'asc' }],
    });
    return cleanData(locations);
  }

  async search(query: PaginationQueryDto) {
    const { search } = query;
    const locations = await this.prisma.locations.findMany({
      where: {
        OR: [
          { province: { contains: search } },
          // { district: { contains: search } },
          // { ward: { contains: search } },
          // { street: { contains: search } },
        ],
      },
      orderBy: [{ province: 'asc' }, { district: 'asc' }, { ward: 'asc' }],
    });
    return cleanData(locations);
  }

  async listProvinces() {
    const provinces = await this.prisma.locations.groupBy({
      by: ['province'],
      where: { isDeleted: false },
      _max: { updatedAt: true },
    });

    const provinceData = await Promise.all(
      provinces.map(async (p) => {
        const row = await this.prisma.locations.findFirst({
          where: { province: p.province, isDeleted: false },
          orderBy: { updatedAt: 'desc' },
          select: { province: true, provinceImageUrl: true },
        });
        return {
          province: row?.province,
          image: row?.provinceImageUrl
            ? buildImageUrl(row.provinceImageUrl)
            : null,
        };
      }),
    );

    return provinceData
      .filter((x) => !!x.province)
      .sort((a, b) => (a.province ?? '').localeCompare(b.province ?? ''));
  }

  async listDistricts(province: string) {
    const rows = await this.prisma.locations.findMany({
      where: { isDeleted: false, province },
      distinct: ['district'],
      select: { district: true },
      orderBy: { district: 'asc' },
    });
    return rows.map((r) => r.district);
  }

  async listWards(province: string, district: string) {
    const rows = await this.prisma.locations.findMany({
      where: { isDeleted: false, province, district },
      distinct: ['ward'],
      select: { ward: true },
      orderBy: { ward: 'asc' },
    });
    return rows.map((r) => r.ward).filter(Boolean);
  }

  async findOne(id: number) {
    const location = await this.prisma.locations.findFirst({
      where: { id, isDeleted: false },
    });
    if (!location) throw new BadRequestException('Location không tồn tại');
    return cleanData(location);
  }

  async create(createLocationDto: CreateLocationDto) {
    return this.prisma.locations.create({ data: createLocationDto });
  }

  async update(id: number, updateLocationDto: UpdateLocationDto) {
    await this.findOne(id);
    return this.prisma.locations.update({
      where: { id },
      data: updateLocationDto,
    });
  }

  async remove(id: number, deletedBy: number = 0) {
    await this.findOne(id);

    const countRooms = await this.prisma.rooms.count({
      where: { locationId: id, isDeleted: false },
    });
    if (countRooms > 0) {
      throw new BadRequestException(
        'Không thể xoá, còn phòng sử dụng location này',
      );
    }

    await this.prisma.locations.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), deletedBy },
    });

    return { message: 'Xoá location thành công' };
  }

  async setProvinceImage(province: string, file: Express.Multer.File) {
    if (!province?.trim())
      throw new BadRequestException('Thiếu tên tỉnh/thành');
    if (!file) throw new BadRequestException('Không có file upload');

    const normalized = province.trim();

    const one = await this.prisma.locations.findFirst({
      where: { province: normalized, isDeleted: false },
      select: { provinceImageUrl: true },
    });
    if (!one)
      throw new NotFoundException(
        `Không tìm thấy province = "${normalized}" trong dữ liệu locations`,
      );

    const res: any = await this.cloudinary.uploadImage(
      file.buffer,
      `provinces/${normalized}`,
    );

    const upd = await this.prisma.locations.updateMany({
      where: { province: normalized, isDeleted: false },
      data: { provinceImageUrl: res.public_id, updatedAt: new Date() },
    });

    if (one.provinceImageUrl) {
      this.cloudinary.deleteImage(one.provinceImageUrl).catch(() => null);
    }

    return {
      message: 'Cập nhật ảnh province thành công',
      province: normalized,
      affectedLocations: upd.count,
      filename: res.public_id,
      imageUrl: res.secure_url,
    };
  }

  async deleteProvinceImage(province: string) {
    if (!province?.trim())
      throw new BadRequestException('Thiếu tên tỉnh/thành');
    const normalized = province.trim();

    const one = await this.prisma.locations.findFirst({
      where: {
        province: normalized,
        isDeleted: false,
        NOT: { provinceImageUrl: null },
      },
      select: { provinceImageUrl: true },
    });
    if (!one)
      return { message: 'Tỉnh/thành chưa có ảnh', province: normalized };

    await this.cloudinary
      .deleteImage(one.provinceImageUrl ?? '')
      .catch(() => null);

    const upd = await this.prisma.locations.updateMany({
      where: { province: normalized, isDeleted: false },
      data: { provinceImageUrl: null, updatedAt: new Date() },
    });

    return {
      message: 'Xoá ảnh province thành công',
      province: normalized,
      affectedLocations: upd.count,
    };
  }
}
