import { Global, Module } from '@nestjs/common';
import { AppConfigsService } from './app-configs.service';
import { AppConfigsController } from './app-configs.controller';
import { PrismaService } from '../prisma/prisma.service';

@Global()
@Module({
  controllers: [AppConfigsController],
  providers: [AppConfigsService, PrismaService],
  exports: [AppConfigsService],
})
export class AppConfigsModule {}
