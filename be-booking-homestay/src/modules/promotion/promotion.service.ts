import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { bookings_status } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { PromotionQueryDto } from './dto/promotion-query.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== ADMIN CRUD ====================

  /**
   * Tạo mới promotion (Admin).
   */
  async create(dto: CreatePromotionDto) {
    const code = dto.code.toUpperCase().trim();

    // Kiểm tra trùng code
    const existing = await this.prisma.promotions.findFirst({
      where: { code, isDeleted: false },
    });
    if (existing) {
      throw new BadRequestException(`Mã "${code}" đã tồn tại`);
    }

    const promotion = await this.prisma.promotions.create({
      data: {
        code,
        name: dto.name,
        promotionType: dto.promotionType || 'SEASONAL',
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        maxDiscount: dto.maxDiscount ?? null,
        minOrderValue: dto.minOrderValue ?? 0,
        provinceId: dto.provinceId ?? null,
        targetLevelId: dto.targetLevelId ?? null,
        usageLimit: dto.usageLimit,
        perUserLimit: dto.perUserLimit ?? 1,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        isPublic: dto.isPublic ?? true,
        isActive: dto.isActive ?? true,
      },
    });

    // Gắn blog posts nếu có
    if (dto.blogPostIds && dto.blogPostIds.length > 0) {
      await this.prisma.blog_promotions.createMany({
        data: dto.blogPostIds.map((postId) => ({
          postId,
          promotionId: promotion.id,
        })),
        skipDuplicates: true,
      });
    }

    return promotion;
  }

  /**
   * Danh sách promotions (Admin, phân trang + lọc).
   */
  async findAll(query: PromotionQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.max(1, Number(query.pageSize) || 10);
    const skip = (page - 1) * pageSize;
    const now = new Date();

    const where: any = { isDeleted: false };

    if (query.search) {
      where.OR = [
        { code: { contains: query.search } },
        { name: { contains: query.search } },
      ];
    }

    if (query.promotionType) {
      where.promotionType = query.promotionType;
    }

    if (query.status === 'active') {
      where.isActive = true;
      where.startDate = { lte: now };
      where.endDate = { gte: now };
    } else if (query.status === 'expired') {
      where.endDate = { lt: now };
    }

    const allItems = await this.prisma.promotions.findMany({
      where,
      include: {
        blog_promotions: {
          include: {
            post: { select: { id: true, title: true, slug: true } },
          },
        },
        targetLevel: { select: { id: true, name: true } },
        _count: {
          select: { promotion_usages: true, user_vouchers: true },
        },
      },
    });

    // Sắp xếp: Mã chưa hết hạn lên đầu, đã hết hạn xuống dưới, trong mỗi nhóm xếp theo createdAt desc
    allItems.sort((a, b) => {
      const aExpired = now > new Date(a.endDate);
      const bExpired = now > new Date(b.endDate);
      if (aExpired !== bExpired) {
        return aExpired ? 1 : -1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total = allItems.length;
    const items = allItems.slice(skip, skip + pageSize);

    return {
      items: items.map((item) => ({
        ...item,
        blogPosts: item.blog_promotions.map((bp) => bp.post),
        blog_promotions: undefined,
        usageStats: {
          totalUsed: item._count.promotion_usages,
          totalCollected: item._count.user_vouchers,
        },
        _count: undefined,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Chi tiết promotion (Admin).
   */
  async findOne(id: number) {
    const promotion = await this.prisma.promotions.findFirst({
      where: { id, isDeleted: false },
      include: {
        blog_promotions: {
          include: {
            post: { select: { id: true, title: true, slug: true } },
          },
        },
        targetLevel: { select: { id: true, name: true } },
        _count: {
          select: { promotion_usages: true, user_vouchers: true },
        },
      },
    });

    if (!promotion) {
      throw new NotFoundException('Mã giảm giá không tồn tại');
    }

    return {
      ...promotion,
      blogPosts: promotion.blog_promotions.map((bp) => bp.post),
      blog_promotions: undefined,
      usageStats: {
        totalUsed: promotion._count.promotion_usages,
        totalCollected: promotion._count.user_vouchers,
      },
      _count: undefined,
    };
  }

  /**
   * Cập nhật promotion (Admin).
   */
  async update(id: number, dto: UpdatePromotionDto) {
    const existing = await this.prisma.promotions.findFirst({
      where: { id, isDeleted: false },
    });
    if (!existing) {
      throw new NotFoundException('Mã giảm giá không tồn tại');
    }

    const promotion = await this.prisma.promotions.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.promotionType && { promotionType: dto.promotionType }),
        ...(dto.discountType && { discountType: dto.discountType }),
        ...(dto.discountValue !== undefined && {
          discountValue: dto.discountValue,
        }),
        ...(dto.maxDiscount !== undefined && {
          maxDiscount: dto.maxDiscount,
        }),
        ...(dto.minOrderValue !== undefined && {
          minOrderValue: dto.minOrderValue,
        }),
        ...(dto.provinceId !== undefined && {
          provinceId: dto.provinceId,
        }),
        ...(dto.targetLevelId !== undefined && {
          targetLevelId: dto.targetLevelId,
        }),
        ...(dto.usageLimit !== undefined && { usageLimit: dto.usageLimit }),
        ...(dto.perUserLimit !== undefined && {
          perUserLimit: dto.perUserLimit,
        }),
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate && { endDate: new Date(dto.endDate) }),
        ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        updatedAt: new Date(),
      },
    });

    // Cập nhật blog posts association
    if (dto.blogPostIds !== undefined) {
      await this.prisma.blog_promotions.deleteMany({
        where: { promotionId: id },
      });
      if (dto.blogPostIds.length > 0) {
        await this.prisma.blog_promotions.createMany({
          data: dto.blogPostIds.map((postId) => ({
            postId,
            promotionId: id,
          })),
          skipDuplicates: true,
        });
      }
    }

    return this.findOne(id);
  }

  /**
   * Soft delete promotion (Admin).
   */
  async remove(id: number) {
    const existing = await this.prisma.promotions.findFirst({
      where: { id, isDeleted: false },
    });
    if (!existing) {
      throw new NotFoundException('Mã giảm giá không tồn tại');
    }

    await this.prisma.promotions.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), isActive: false },
    });

    return { message: 'Đã xóa mã giảm giá' };
  }

  /**
   * Bật/tắt promotion (Admin).
   */
  async toggleActive(id: number) {
    const existing = await this.prisma.promotions.findFirst({
      where: { id, isDeleted: false },
    });
    if (!existing) {
      throw new NotFoundException('Mã giảm giá không tồn tại');
    }

    const updated = await this.prisma.promotions.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    return {
      message: updated.isActive
        ? 'Đã kích hoạt mã giảm giá'
        : 'Đã tạm ngừng mã giảm giá',
      isActive: updated.isActive,
    };
  }

  // ==================== USER-FACING ====================

  /**
   * Gợi ý coupon phù hợp cho user tại checkout.
   */
  async getSuggestions(userId: number, provinceId?: number, total?: number) {
    const now = new Date();

    // Parallel: lấy hạng thành viên + thống kê booking + ví voucher
    const [loyalty, bookingsByStatus, userWalletVouchers] = await Promise.all([
      this.prisma.loyalty_program.findFirst({ where: { userId } }),
      this.prisma.bookings.groupBy({
        by: ['status'],
        where: { userId },
        _count: true,
      }),
      this.prisma.user_vouchers.findMany({
        where: { userId, status: 'AVAILABLE' },
        select: { promotionId: true },
      }),
    ]);

    const userLevelId = loyalty?.levelId || null;
    const walletPromoIds = userWalletVouchers.map((v) => v.promotionId);

    // Tính isNewUser + hasCompletedBooking từ 1 kết quả groupBy
    const cancelledStatuses = new Set<bookings_status>([
      bookings_status.CANCELLED,
      bookings_status.CANCELLED_BY_ADMIN,
    ]);
    const activeBookings = bookingsByStatus
      .filter(
        (b: { status: bookings_status; _count: number }) =>
          !cancelledStatuses.has(b.status),
      )
      .reduce(
        (sum: number, b: { status: bookings_status; _count: number }) =>
          sum + b._count,
        0,
      );
    const isNewUser = activeBookings === 0;
    const hasCompletedBooking = bookingsByStatus.some(
      (b: { status: bookings_status; _count: number }) =>
        b.status === bookings_status.CHECKED_OUT && b._count > 0,
    );

    // Tìm coupon phù hợp
    const promotions = await this.prisma.promotions.findMany({
      where: {
        isDeleted: false,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
        OR: [
          { targetLevelId: null },
          ...(userLevelId ? [{ targetLevelId: userLevelId }] : []),
        ],
        AND: [
          {
            OR: [{ provinceId: null }, ...(provinceId ? [{ provinceId }] : [])],
          },
          walletPromoIds.length > 0
            ? {
                OR: [{ isPublic: true }, { id: { in: walletPromoIds } }],
              }
            : { isPublic: true },
          // Nếu không phải người mới, loại bỏ mã WELCOME
          ...(!isNewUser ? [{ promotionType: { not: 'WELCOME' as any } }] : []),
          // Nếu chưa hoàn thành booking nào, loại bỏ mã THANKYOU
          ...(!hasCompletedBooking
            ? [{ promotionType: { not: 'THANKYOU' as any } }]
            : []),
        ],
      },
      orderBy: { discountValue: 'desc' },
      take: 20,
    });

    if (promotions.length === 0) return [];

    // Batch query: đếm usage per promo cho user (thay vì N+1 loop)
    const promoIds = promotions.map((p) => p.id);
    const usageCounts = await this.prisma.promotion_usages.groupBy({
      by: ['promotionId'],
      where: { promotionId: { in: promoIds }, userId },
      _count: true,
    });
    const usageMap = new Map(usageCounts.map((u) => [u.promotionId, u._count]));

    // Lọc theo lượt dùng per user + đơn tối thiểu
    const results: any[] = [];
    for (const promo of promotions) {
      if (promo.usedCount >= promo.usageLimit) continue;

      const userUsed = usageMap.get(promo.id) || 0;
      if (userUsed >= promo.perUserLimit) continue;

      if (total && total < Number(promo.minOrderValue || 0)) continue;

      results.push(promo);
      if (results.length >= 10) break;
    }

    return results;
  }

  /**
   * Lưu coupon vào ví user.
   */
  async collectCoupon(userId: number, promotionId: number) {
    const now = new Date();

    const promotion = await this.prisma.promotions.findFirst({
      where: {
        id: promotionId,
        isDeleted: false,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });
    if (!promotion) {
      throw new NotFoundException('Mã giảm giá không tồn tại hoặc đã hết hạn');
    }

    if (promotion.usedCount >= promotion.usageLimit) {
      throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng');
    }

    try {
      await this.prisma.user_vouchers.create({
        data: { userId, promotionId, status: 'AVAILABLE' },
      });
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new BadRequestException('Bạn đã lưu mã này rồi');
      }
      throw err;
    }

    return { message: `Đã lưu mã ${promotion.code} vào ví` };
  }

  /**
   * Lấy ví voucher của user (phân tab: AVAILABLE / USED / EXPIRED).
   */
  async getWallet(userId: number, status?: string) {
    const now = new Date();
    const where: any = { userId };

    if (status === 'USED') {
      where.status = 'USED';
    } else if (status === 'EXPIRED') {
      where.status = 'EXPIRED';
    } else if (status === 'AVAILABLE') {
      where.status = 'AVAILABLE';
    }

    const vouchers = await this.prisma.user_vouchers.findMany({
      where,
      include: { promotions: true },
      orderBy: { collectedAt: 'desc' },
    });

    // Auto-expire + transform trong 1 lần duyệt
    const expiredIds: number[] = [];
    const result = vouchers.map((v) => {
      const isExpired =
        v.status === 'AVAILABLE' && new Date(v.promotions.endDate) < now;

      if (isExpired) expiredIds.push(v.id);

      return {
        ...v,
        status: isExpired ? 'EXPIRED' : v.status,
        promotion: v.promotions,
        promotions: undefined,
      };
    });

    // Cập nhật EXPIRED trong DB (fire-and-forget with logging)
    if (expiredIds.length > 0) {
      this.prisma.user_vouchers
        .updateMany({
          where: { id: { in: expiredIds } },
          data: { status: 'EXPIRED' },
        })
        .catch((err) =>
          console.error('[VoucherWallet] Auto-expire update failed:', err),
        );
    }

    // Nếu filter AVAILABLE thì loại bỏ các voucher vừa bị expire
    if (status === 'AVAILABLE') {
      return result.filter((v) => v.status === 'AVAILABLE');
    }

    return result;
  }

  /**
   * Lấy coupon gắn trong bài blog.
   */
  async getBlogCoupons(postId: number) {
    const now = new Date();
    const blogPromotions = await this.prisma.blog_promotions.findMany({
      where: {
        postId,
        promotion: {
          isActive: true,
          isDeleted: false,
          startDate: { lte: now },
          endDate: { gte: now },
        },
      },
      include: { promotion: true },
    });

    // usedCount < usageLimit không thể so sánh 2 cột trên Prisma, giữ lại JS filter
    return blogPromotions
      .filter((bp) => bp.promotion.usedCount < bp.promotion.usageLimit)
      .map((bp) => bp.promotion);
  }

  // ==================== STATISTICS (Admin Dashboard) ====================

  /**
   * Thống kê tổng quan coupon cho Admin Dashboard.
   */
  async getStatistics() {
    const now = new Date();

    // KPI Cards
    const [
      totalPromotions,
      activePromotions,
      totalUsages,
      totalDiscountResult,
    ] = await Promise.all([
      this.prisma.promotions.count({ where: { isDeleted: false } }),
      this.prisma.promotions.count({
        where: {
          isDeleted: false,
          isActive: true,
          startDate: { lte: now },
          endDate: { gte: now },
        },
      }),
      this.prisma.promotion_usages.count(),
      this.prisma.promotion_usages.aggregate({
        _sum: { discountAmount: true },
      }),
    ]);

    // Bảng xếp hạng coupon hiệu quả nhất
    const topPromotions = await this.prisma.promotions.findMany({
      where: { isDeleted: false },
      orderBy: { usedCount: 'desc' },
      take: 10,
      select: {
        id: true,
        code: true,
        name: true,
        promotionType: true,
        discountType: true,
        discountValue: true,
        usageLimit: true,
        usedCount: true,
        _count: { select: { promotion_usages: true } },
      },
    });

    // Thống kê theo loại promotion
    const byType = await this.prisma.promotions.groupBy({
      by: ['promotionType'],
      where: { isDeleted: false },
      _count: true,
      _sum: { usedCount: true },
    });

    return {
      kpiCards: {
        totalPromotions,
        activePromotions,
        totalUsages,
        totalDiscountAmount: Number(
          totalDiscountResult._sum.discountAmount || 0,
        ),
      },
      topPromotions: topPromotions.map((p) => ({
        ...p,
        usageRate:
          p.usageLimit > 0 ? Math.round((p.usedCount / p.usageLimit) * 100) : 0,
        _count: undefined,
      })),
      byType: byType.map((bt) => ({
        type: bt.promotionType,
        count: bt._count,
        totalUsed: bt._sum.usedCount || 0,
      })),
    };
  }
}
