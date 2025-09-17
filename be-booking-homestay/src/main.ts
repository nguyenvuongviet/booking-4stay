import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { PORT } from './common/constant/app.constant';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggingInterceptor } from './common/interceptor/logging.interceptor';
import { ResponseSuccessInterceptor } from './common/interceptor/response-success.interceptor';
import { ProtectGuard } from './common/guard/protect/protect.guard';
import { RolesGuard } from './common/guard/roles.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', //'http://localhost:3000',
    credentials: false, // true,
  });

  // GLOBAL MIDDLEWARE
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ những field không có trong dto
      forbidNonWhitelisted: true, // Nếu trong dto không khai báo thì sẽ bắn lỗi => throw error
    }),
  ); // bật validation global

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new ProtectGuard(reflector));
  app.useGlobalGuards(new RolesGuard(reflector));
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new ResponseSuccessInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Booking Homestay API')
    .setDescription('Tài liệu API cơ bản cho Booking Homestay')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'AccessToken',
    )
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, documentFactory, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = PORT || 3069;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(
    `API Documentations running on: http://localhost:${port}/api-docs`,
  );
}
bootstrap();
