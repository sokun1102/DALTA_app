/**
 * =====================================================
 * PRODUCTS SERVICE MAIN - Chạy trên port 3001
 * =====================================================
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const uploadsRoot = join(process.cwd(), 'uploads');
  mkdirSync(join(uploadsRoot, 'products'), { recursive: true });
  mkdirSync(join(uploadsRoot, 'cms'), { recursive: true });

  app.enableCors();
  app.useStaticAssets(uploadsRoot, { prefix: '/uploads/' });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const port = process.env.PRODUCTS_PORT || 3001;
  await app.listen(port);
  console.log(`Products Service running on port ${port}`);
}
bootstrap();
