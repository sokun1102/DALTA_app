import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product])], // Đăng ký bảng Product vào module
  controllers: [ProductsController],
  providers: [ProductsService]
})
export class ProductsModule {}
