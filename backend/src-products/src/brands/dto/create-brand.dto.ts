/**
 * =====================================================
 * CREATE BRAND DTO - Dữ liệu tạo thương hiệu
 * =====================================================
 */

import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class CreateBrandDto {
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
  logo?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
