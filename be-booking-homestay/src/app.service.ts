import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from './modules/prisma/prisma.service';
import { exec } from 'child_process';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      const countryCount = await this.prisma.location_countries.count();
      
      if (countryCount === 0) {
        this.logger.log('Server mới cài đặt (Database trắng)! Đang tự động tải Dữ liệu Tỉnh/Thành...');
        
        exec('npx prisma db seed', (error, stdout, stderr) => {
          if (error) {
            this.logger.error(`Lỗi Auto-Seed: ${error.message}`);
            return;
          }
          this.logger.log('Đã tự động tải dữ liệu Tỉnh/Thành/Xã thành công!');
        });
      }
    } catch (err) {
       this.logger.error('Lỗi khi kiểm tra dữ liệu Location:', err);
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
