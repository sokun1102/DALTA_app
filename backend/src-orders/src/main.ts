import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { OrdersAppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(OrdersAppModule, { rawBody: true });

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.ORDERS_PORT || 3003;
  await app.listen(port);
  console.log(`Orders Service running on port ${port}`);
}

bootstrap();
