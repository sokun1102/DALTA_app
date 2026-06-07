/**
 * =====================================================
 * MAIN APP - Auth + Users Service
 * =====================================================
 * Chạy trên port 3000
 * Products: port 3001
 * Categories: port 3002
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { mkdirSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  const uploadsRoot = join(process.cwd(), 'uploads');
  mkdirSync(join(uploadsRoot, 'avatars'), { recursive: true });

  app.enableCors();
  app.useStaticAssets(uploadsRoot, { prefix: '/uploads/' });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const port = process.env.AUTH_USERS_PORT || process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Auth + Users Service running on port ${port}`);
}
bootstrap();
