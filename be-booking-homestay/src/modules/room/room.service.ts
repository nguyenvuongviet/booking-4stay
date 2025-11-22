import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ensureDateRange } from 'src/utils/date.util';
import { sanitizeRoom } from 'src/utils/sanitize/room.sanitize';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomFilterDto } from './dto/filter-room.dto';
import { BedItemDto, BedType } from './dto/set-room-beds.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomHelper } from './room.helpers';

const OVERLAP_STATUSES = ['PENDING', 'CONFIRMED', 'CHECKED_IN'] as const;
const SORT_BY = new Set(['price', 'rating', 'createdAt']);
const SORT_ORDER = new Set(['asc', 'desc']);

@Injectable()
export class RoomService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly roomHelper: RoomHelper,
  ) {}

  async findAll(query: RoomFilterDto) {
    let {
      province,
      minPrice,
      maxPrice,
      adults,
      children,
      minRating,
      checkIn,
      checkOut,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      pageSize = 12,
    } = query;

    province = province?.trim();
    sortBy = SORT_BY.has(sortBy ?? '') ? sortBy! : 'createdAt';
    sortOrder = SORT_ORDER.has(sortOrder ?? '') ? sortOrder! : 'desc';
    page = Math.max(1, Number(page) || 1);
    pageSize = Math.max(1, Number(pageSize) || 12);

    if (minPrice && maxPrice && minPrice > maxPrice)
      throw new BadRequestException(
        'Giá tối thiểu không được lớn hơn giá tối đa',
      );

    let inDate: Date | undefined;
    let outDate: Date | undefined;
    if (checkIn || checkOut) {
      if (!checkIn || !checkOut)
        throw new BadRequestException('Cần truyền đủ cả checkIn và checkOut');
      const r = ensureDateRange(checkIn, checkOut);
      inDate = r.inDate;
      outDate = r.outDate;
    }

    let provinceId: number | undefined;
    if (province) {
      const exists = await this.prisma.location_provinces.findFirst({
        where: {
          name: { contains: province },
          isDeleted: false,
        },
        select: { id: true },
      });
      if (!exists) {
        throw new NotFoundException(`Không tìm thấy province = "${province}"`);
      }
      provinceId = exists.id;
    }

    const where: any = { isDeleted: false };
    if (provinceId) where.provinceId = provinceId;

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    if (adults) where.adultCapacity = { gte: adults };
    if (children !== undefined) where.childCapacity = { gte: children };
    if (minRating) where.rating = { gte: minRating };

    if (inDate && outDate) {
      where.bookings = {
        none: {
          status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
          AND: [{ checkOut: { gt: inDate } }, { checkIn: { lt: outDate } }],
        },
      };
      where.room_availability = {
        none: {
          date: { gte: inDate, lt: outDate },
          isAvailable: false,
        },
      };
    }

    const skip = (page - 1) * pageSize;
    const orderBy = { [sortBy]: sortOrder };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.rooms.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          room_images: true,
          room_amenities: { include: { amenities: true } },
          room_beds: true,
          location_countries: true,
          location_provinces: true,
          location_districts: true,
          location_wards: true,
          users: true,
        },
      }),
      this.prisma.rooms.count({ where }),
    ]);

    if (total === 0)
      throw new NotFoundException('Không tìm thấy phòng nào phù hợp');

    return {
      message: 'Lấy danh sách phòng thành công',
      page,
      pageSize,
      total,
      items: sanitizeRoom(items),
    };
  }

  async findOne(id: number) {
    const room = await this.prisma.rooms.findFirst({
      where: {
        id,
        isDeleted: false,
        users: {
          isActive: true,
          isDeleted: false,
        },
      },
      include: {
        location_countries: true,
        location_provinces: true,
        location_districts: true,
        location_wards: true,
        room_images: true,
        room_amenities: {
          include: { amenities: true },
        },
        room_beds: true,
        users: true,
      },
    });

    if (!room) {
      throw new BadRequestException('Phòng không tồn tại');
    }

    return sanitizeRoom(room);
  }

  async create(hostId: number = 1, dto: CreateRoomDto) {
    return this.prisma.rooms.create({
      data: { ...dto, hostId },
    });
  }

  async update(id: number, dto: UpdateRoomDto) {
    await this.findOne(id);
    return this.prisma.rooms.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    const roomExist = await this.prisma.rooms.findFirst({
      where: { id, isDeleted: false },
      select: { id: true },
    });

    if (!roomExist) {
      throw new BadRequestException('Phòng không tồn tại hoặc đã bị xoá');
    }

    await this.prisma.rooms.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async setAmenities(roomId: number, amenityIds: number[]) {
    await this.roomHelper.ensureRoomExists(roomId);

    const ids = Array.isArray(amenityIds)
      ? [...new Set(amenityIds.filter((x) => Number.isInteger(x) && x > 0))]
      : [];

    await this.prisma.$transaction(async (tx) => {
      await tx.room_amenities.deleteMany({ where: { roomId } });
      if (ids.length > 0) {
        await tx.room_amenities.createMany({
          data: ids.map((amenityId) => ({ roomId, amenityId })),
          skipDuplicates: true,
        });
      }
    });

    return { roomId, amenityIds: ids, total: ids.length };
  }

  async setBeds(roomId: number, beds: BedItemDto[]) {
    await this.roomHelper.ensureRoomExists(roomId);

    const merged = new Map<BedType, number>();
    for (const item of beds ?? []) {
      if (!item) continue;
      const qty = Number(item.quantity) || 0;
      if (qty < 1) continue;
      merged.set(item.type, (merged.get(item.type) || 0) + qty);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.room_beds.deleteMany({ where: { roomId } });

      const data = Array.from(merged.entries()).map(([type, quantity]) => ({
        roomId,
        type,
        quantity,
      }));

      if (data.length) {
        await tx.room_beds.createMany({ data });
      }
    });

    const result = Array.from(merged.entries()).map(([type, quantity]) => ({
      type,
      quantity,
    }));
    return { roomId, beds: result, totalTypes: result.length };
  }

  async addRoomImages(
    roomId: number,
    files: Express.Multer.File[],
    images: { isMain?: boolean }[] = [],
  ) {
    if (!files?.length)
      throw new BadRequestException('Không có file được upload');

    const room = await this.prisma.rooms.findFirst({
      where: { id: roomId, isDeleted: false },
    });
    if (!room) throw new BadRequestException('Phòng không tồn tại');

    const existingImages = await this.prisma.room_images.findMany({
      where: { roomId },
      select: { id: true, isMain: true },
    });
    const existingCount = existingImages.length;
    const hasMain = existingImages.some((x) => x.isMain);

    const uploaded = await Promise.all(
      files.map((file, i) =>
        this.cloudinary
          .uploadImage(file.buffer, `rooms/${room.name}`)
          .then((res: any) => ({
            publicId: res.public_id,
            secureUrl: res.secure_url,
            isMain: images[i]?.isMain ?? false,
          })),
      ),
    );

    let mainIndex = uploaded.findIndex((x) => x.isMain);
    if (hasMain) {
      uploaded.forEach((x) => (x.isMain = false));
    } else if (mainIndex === -1 && uploaded.length > 0) {
      mainIndex = 0;
      uploaded[0].isMain = true;
    }

    const newImages = uploaded.map((img, i) => ({
      roomId,
      imageUrl: img.publicId,
      isMain: img.isMain ? true : false,
      position: existingCount + i + 1,
    }));

    await this.prisma.room_images.createMany({ data: newImages });

    return {
      message: 'Thêm ảnh phòng thành công',
      roomId,
      added: newImages.length,
      total: existingCount + newImages.length,
      images: uploaded.map((img, i) => ({
        imageUrl: img.publicId,
        displayUrl: img.secureUrl,
        isMain: img.isMain,
        position: existingCount + i + 1,
      })),
    };
  }

  async deleteRoomImagesByIds(roomId: number, imageIds: number[]) {
    await this.roomHelper.ensureRoomExists(roomId);

    if (!imageIds?.length)
      throw new BadRequestException('Danh sách ảnh cần xoá không được rỗng.');

    const images = await this.prisma.room_images.findMany({
      where: { roomId, id: { in: imageIds } },
      select: { id: true, imageUrl: true },
    });

    if (!images.length)
      throw new BadRequestException('Không tìm thấy ảnh hợp lệ để xoá.');

    await this.prisma.room_images.deleteMany({
      where: { roomId, id: { in: imageIds } },
    });

    for (const img of images) {
      if (img.imageUrl) {
        this.cloudinary.deleteImage(img.imageUrl).catch(() => null);
      }
    }

    return {
      message: 'Xoá ảnh thành công',
      deleted: images.length,
      image: images.map((x) => x.imageUrl),
    };
  }
}
