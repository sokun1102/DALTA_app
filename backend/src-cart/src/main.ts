import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { CartAppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(CartAppModule);

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.CART_PORT || 3004;
  await app.listen(port);
  console.log(`Cart Service running on port ${port}`);
}

bootstrap();
