/**
 * =====================================================
 * PRODUCTS MODULE - Module quản lý sản phẩm
 * =====================================================
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductsModule as BrandsProductsModule } from './brands/brands.module';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { Category } from './entities/category.entity';
import { Brand } from './entities/brand.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage, Category, Brand]),
    BrandsProductsModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
