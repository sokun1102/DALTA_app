import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { PaymentsAppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(PaymentsAppModule, { rawBody: true });

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PAYMENTS_PORT || 3006;
  await app.listen(port);
  console.log(`Payments Service running on port ${port}`);
}

bootstrap();
