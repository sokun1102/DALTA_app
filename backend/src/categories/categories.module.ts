/**
 * =====================================================
 * CATEGORIES MODULE - Module quản lý danh mục
 * =====================================================
 * Module này chứa tất cả các thành phần liên quan đến danh mục:
 * - Controller: Nhận HTTP requests
 * - Service: Xử lý nghiệp vụ
 * - Entity: Định nghĩa cấu trúc bảng
 * 
 * Cần import Product entity vì có quan hệ với Category
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

// Entities
import { Category } from './entities/category.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [
    // Đăng ký cả Category và Product vì có quan hệ với nhau
    TypeOrmModule.forFeature([Category, Product])
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
