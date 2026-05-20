/**
 * =====================================================
 * CREATE CATEGORY DTO - Dữ liệu tạo danh mục
 * =====================================================
 */

import { IsString, IsOptional, IsNumber, IsBoolean, MinLength, Min } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsNumber()
  parentId?: number;
}
