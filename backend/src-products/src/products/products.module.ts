/**
 * =====================================================
 * PRODUCTS MODULE - Module quản lý sản phẩm
 * =====================================================
 */

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { BrandsModule } from '../brands/brands.module';
import { Product } from '../entities/product.entity';
import { ProductImage } from '../entities/product-image.entity';
import { Category } from '../entities/category.entity';
import { Brand } from '../entities/brand.entity';
import { ProductReview } from '../entities/product-review.entity';
import { WishlistItem } from '../entities/wishlist-item.entity';
import { ReviewsController } from './reviews.controller';
import { WishlistController } from './wishlist.controller';
import { ArticlesController } from '../articles/articles.controller';
import { ArticlesService } from '../articles/articles.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      Product,
      ProductImage,
      Category,
      Brand,
      ProductReview,
      WishlistItem,
    ]),
    BrandsModule,
  ],
  controllers: [ProductsController, ReviewsController, WishlistController, ArticlesController],
  providers: [ProductsService, ArticlesService],
  exports: [ProductsService],
})
export class ProductsModule {}
