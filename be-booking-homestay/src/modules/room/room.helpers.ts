import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoomHelper {
  constructor(private readonly prisma: PrismaService) {}

  async ensureRoomExists(roomId: number) {
    const exists = await this.prisma.rooms.findUnique({
      where: { id: roomId },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`Phòng không tồn tại`);
    }
  }
}
