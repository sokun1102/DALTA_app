import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NotificationsAppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(NotificationsAppModule);

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.NOTIFICATIONS_PORT || 3007;
  await app.listen(port);
  console.log(`Notifications Service running on port ${port}`);
}

bootstrap();
