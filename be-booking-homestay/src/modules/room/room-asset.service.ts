import { BadRequestException, Injectable } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { RoomHelper } from './room.helpers';
import { BedItemDto, BedType } from './dto/set-room-beds.dto';

@Injectable()
export class RoomAssetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly roomHelper: RoomHelper,
  ) {}

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

  async setMainImage(roomId: number, imageId: number) {
    await this.roomHelper.ensureRoomExists(roomId);
    const exists = await this.prisma.room_images.findFirst({
      where: { id: imageId, roomId },
    });
    if (!exists) throw new BadRequestException('Ảnh không tồn tại.');

    await this.prisma.room_images.updateMany({
      where: { roomId, isMain: true },
      data: { isMain: false },
    });
    await this.prisma.room_images.update({
      where: { id: imageId },
      data: { isMain: true },
    });

    return { message: 'Đặt ảnh chính thành công', imageId };
  }

  async updateImageOrder(roomId: number, order: number[]) {
    await this.roomHelper.ensureRoomExists(roomId);

    await this.prisma.$transaction(
      order.map((id, i) =>
        this.prisma.room_images.update({
          where: { id },
          data: { position: i + 1 },
        }),
      ),
    );

    return { message: 'Cập nhật thứ tự ảnh thành công', order };
  }
}
