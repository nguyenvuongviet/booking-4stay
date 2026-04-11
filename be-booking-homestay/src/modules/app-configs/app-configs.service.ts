import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AppConfigKey,
  AppConfigDefaults,
} from './constants/app-config.constant';

@Injectable()
export class AppConfigsService {
  private readonly logger = new Logger(AppConfigsService.name);

  constructor(private prisma: PrismaService) {}

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
