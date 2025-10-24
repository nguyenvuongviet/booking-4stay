import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RoomFilterDto } from './dto/filter-room.dto';
import { Prisma } from '@prisma/client';
import { sanitizeRoom } from 'src/helpers/room.helper';
import { BedItemDto, BedType } from './dto/set-room-beds.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ImageItemDto } from './dto/set-room-images.dto';

@Injectable()
export class RoomService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async findAll(filterDto: RoomFilterDto) {
    const {
      page = 1,
      pageSize = 10,
      search,
      minPrice,
      maxPrice,
      adults,
      children,
      minRating,
    } = filterDto;
    const skip = (page - 1) * pageSize;

    const where: Prisma.roomsWhereInput = {
      isDeleted: false,
      users: { isActive: true, isDeleted: false },
      ...(minPrice || maxPrice
        ? { price: { gte: minPrice ?? 0, lte: maxPrice ?? 999999999 } }
        : {}),
      ...(adults ? { adultCapacity: { gte: adults } } : {}),
      ...(children ? { childCapacity: { gte: children } } : {}),
      ...(minRating ? { rating: { gte: minRating } } : {}),
      ...(search ? { locations: { province: { contains: search } } } : {}),
    };
    const [total, rooms] = await Promise.all([
      this.prisma.rooms.count({ where }),
      this.prisma.rooms.findMany({
        skip,
        take: pageSize,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          locations: true,
          room_images: true,
          room_amenities: {
            include: { amenities: true },
          },
          room_beds: true,
          users: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
              avatar: true,
            },
          },
        },
      }),
    ]);

    return {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      data: sanitizeRoom(rooms),
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
        locations: true,
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

  async update(id: number, updateRoomDto: UpdateRoomDto) {
    await this.findOne(id);
    return this.prisma.rooms.update({
      where: { id },
      data: updateRoomDto,
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
          .uploadImage(file.buffer, `rooms/${roomId}`)
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
