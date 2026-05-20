/**
 * =====================================================
 * PRODUCTS MODULE - Module quản lý sản phẩm
 * =====================================================
 * Module này chứa tất cả các thành phần liên quan đến sản phẩm:
 * - Controller: Nhận HTTP requests
 * - Service: Xử lý nghiệp vụ
 * - Entities: Định nghĩa cấu trúc bảng
 * 
 * Được import trong AppModule để sử dụng toàn app
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

// Entities
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';

@Module({
  // Đăng ký các entities để TypeORM quản lý
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage])
  ],
  
  // Controllers xử lý HTTP requests
  controllers: [ProductsController],
  
  // Services xử lý nghiệp vụ
  providers: [ProductsService],
  
  // Export để các module khác có thể inject ProductsService
  exports: [ProductsService],
})
export class ProductsModule {}
