import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AppConfigKey,
  AppConfigDefaults,
} from './constants/app-config.constant';

@Injectable()
export class AppConfigsService implements OnModuleInit {
  private readonly logger = new Logger(AppConfigsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Tự động tạo các bản ghi cấu hình mặc định nếu chưa tồn tại trong DB.
   * Chạy 1 lần duy nhất khi ứng dụng khởi động.
   */
  async onModuleInit() {
    const keys = Object.values(AppConfigKey);
    let seeded = 0;

    for (const key of keys) {
      const existing = await this.prisma.app_configs.findUnique({
        where: { key },
      });

      if (!existing) {
        await this.prisma.app_configs.create({
          data: {
            key,
            value: AppConfigDefaults[key] as any,
            description: `Auto-seeded default for ${key}`,
          },
        });
        seeded++;
      }
    }

    if (seeded > 0) {
      this.logger.log(`[Auto-Seed] Đã tạo ${seeded} config mặc định.`);
    }
  }

  async getConfigValue<T>(key: AppConfigKey, defaultValue?: T): Promise<T> {
    try {
      const config = await this.prisma.app_configs.findUnique({
        where: { key },
      });

      if (!config || config.value === null) {
        return (defaultValue ?? AppConfigDefaults[key]) as T;
      }

      return config.value as T;
    } catch (e) {
      this.logger.error(
        `Lỗi khi lấy config key [${key}], sử dụng giá trị mặc định:`,
        e,
      );
      return (defaultValue ?? AppConfigDefaults[key]) as T;
    }
  }

  async setConfigValue<T>(
    key: string,
    value: T,
    description?: string,
    updatedBy?: number,
  ) {
    return this.prisma.app_configs.upsert({
      where: { key },
      update: {
        value: value as any,
        description: description,
        updatedBy: updatedBy,
        updatedAt: new Date(),
      },
      create: {
        key,
        value: value as any,
        description: description,
        updatedBy: updatedBy,
      },
    });
  }

  async findAll() {
    return this.prisma.app_configs.findMany({
      orderBy: { key: 'asc' },
    });
  }
}
