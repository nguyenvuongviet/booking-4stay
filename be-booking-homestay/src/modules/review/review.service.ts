import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { PrismaService } from '../prisma/prisma.service';
import { sanitizeReviewList } from 'src/utils/sanitize/review.sanitize';
import { ListReviewQuery } from './dto/list-review.query';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(q: ListReviewQuery) {
    const page = Math.max(1, Number(q.page) || 1);
    const pageSize = Math.max(1, Number(q.pageSize) || 10);
    const skip = (page - 1) * pageSize;

    const where: any = {
      isDeleted: false,
      bookings: { isDeleted: false },
    };

    if (q.minRating) where.rating = { gte: q.minRating };
    if (q.maxRating) {
      where.rating = where.rating || {};
      where.rating.lte = q.maxRating;
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.reviews.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          users: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
          bookings: { select: { id: true } },
        },
      }),
      this.prisma.reviews.count({ where }),
    ]);

    return { page, pageSize, total, items: sanitizeReviewList(items) };
  }

  async create(userId: number, dto: CreateReviewDto) {
    const b = await this.prisma.bookings.findUnique({
      where: { id: dto.bookingId },
      select: {
        id: true,
        userId: true,
        status: true,
        isDeleted: true,
        isReview: true,
      },
    });

    if (!b || b.isDeleted) throw new NotFoundException('Booking không tồn tại');
    if (b.userId !== userId)
      throw new ForbiddenException(
        'Bạn không thể review booking của người khác',
      );
    if (b.status !== 'CHECKED_OUT')
      throw new BadRequestException('Chỉ review được sau khi CHECKED_OUT');

    if (b.isReview) throw new BadRequestException('Booking này đã được review');

    await this.prisma.$transaction([
      this.prisma.reviews.create({
        data: {
          bookingId: dto.bookingId,
          userId,
          rating: dto.rating,
          comment: dto.comment ?? null,
        },
      }),
      this.prisma.bookings.update({
        where: { id: dto.bookingId },
        data: { isReview: true },
      }),
    ]);

    return { message: 'Tạo review thành công' };
  }

  async listByRoom(roomId: number, q: ListReviewQuery) {
    const page = Math.max(1, Number(q.page) || 1);
    const pageSize = Math.max(1, Number(q.pageSize) || 10);
    const skip = (page - 1) * pageSize;

    const where: any = {
      isDeleted: false,
      bookings: { roomId, isDeleted: false },
    };

    if (q.minRating) where.rating = { gte: q.minRating };
    if (q.maxRating) {
      where.rating = where.rating || {};
      where.rating.lte = q.maxRating;
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.reviews.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          users: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
          bookings: { select: { id: true } },
        },
      }),
      this.prisma.reviews.count({ where }),
    ]);

    return { page, pageSize, total, items: sanitizeReviewList(items) };
  }

  async remove(id: number, role: string) {
    const r = await this.prisma.reviews.findUnique({
      where: { id },
      select: { id: true, userId: true, isDeleted: true },
    });
    if (!r || r.isDeleted) throw new NotFoundException('Review không tồn tại');

    if (role !== 'ADMIN') {
      throw new ForbiddenException('Bạn không thể xoá review của người khác');
    }

    await this.prisma.reviews.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return { message: 'Xoá review thành công' };
  }
}
