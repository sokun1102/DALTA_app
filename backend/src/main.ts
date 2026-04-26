import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Cho phép Frontend gọi API
  app.enableCors();
  
  // Kích hoạt Validation toàn cục
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Tự động loại bỏ các trường không được định nghĩa trong DTO
    forbidNonWhitelisted: true, // Báo lỗi nếu có trường lạ gửi lên
    transform: true, // Tự động chuyển đổi kiểu dữ liệu (ví dụ từ string sang number)
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
