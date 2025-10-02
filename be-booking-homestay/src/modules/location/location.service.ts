import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@Injectable()
export class LocationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.locations.findMany({
      where: { isDeleted: false },
      orderBy: [{ province: 'asc' }, { district: 'asc' }, { ward: 'asc' }],
      select: {
        id: true,
        province: true,
        district: true,
        ward: true,
        street: true,
      },
    });
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
      select: {
        id: true,
        province: true,
        district: true,
        ward: true,
        street: true,
      },
    });
    return locations;
  }

  async listProvinces() {
    const rows = await this.prisma.locations.findMany({
      where: { isDeleted: false },
      distinct: ['province'],
      select: { province: true },
      orderBy: { province: 'asc' },
    });
    return rows.map((r) => r.province);
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
      select: {
        id: true,
        province: true,
        district: true,
        ward: true,
        street: true,
      },
    });
    if (!location) throw new BadRequestException('Location không tồn tại');
    return location;
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

    return this.prisma.locations.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), deletedBy },
    });
  }
}
