/**
 * =====================================================
 * CREATE PRODUCT DTO - Dữ liệu tạo sản phẩm mới
 * =====================================================
 */

import {
  IsString,
  IsNumber,
  IsOptional,
  IsPositive,
  MinLength,
  IsArray,
  ValidateNested,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductImageDto {
  @IsString()
  url: string;

  @IsOptional()
  isPrimary?: boolean;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsString()
  altText?: string;
}

export class CreateProductDto {
  @IsString({ message: 'Tên sản phẩm phải là chuỗi ký tự' })
  @MinLength(3, { message: 'Tên sản phẩm phải có ít nhất 3 ký tự' })
  name: string;

  @IsNumber({}, { message: 'Giá sản phẩm phải là con số' })
  @IsPositive({ message: 'Giá sản phẩm phải lớn hơn 0' })
  price: number;

  @IsOptional()
  @IsNumber({}, { message: 'Giá gốc phải là con số' })
  @IsPositive({ message: 'Giá gốc phải lớn hơn 0' })
  originalPrice?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  reviewCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  soldCount?: number;

  @IsOptional()
  @IsObject()
  specifications?: Record<string, string>;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  weight?: string;

  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];
}
