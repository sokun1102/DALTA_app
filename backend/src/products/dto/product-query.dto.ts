/**
 * =====================================================
 * PRODUCT QUERY DTO - Định nghĩa query parameters cho filter/search/pagination
 * =====================================================
 * File này định nghĩa các tham số truy vấn mà client có thể gửi lên API
 * khi muốn lọc, tìm kiếm, sắp xếp và phân trang sản phẩm.
 */

import { IsString, IsNumber, IsOptional, IsPositive, Min, Max, IsArray, IsBoolean, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * Các tùy chọn sắp xếp
 */
export enum SortOrder {
  ASC = 'ASC',  // Tăng dần
  DESC = 'DESC', // Giảm dần
}

/**
 * Các trường có thể sắp xếp theo
 */
export enum SortBy {
  PRICE = 'price',        // Theo giá
  CREATED_AT = 'createdAt', // Theo ngày tạo
  RATING = 'rating',       // Theo đánh giá
  SOLD_COUNT = 'soldCount', // Theo số lượng bán
  VIEW_COUNT = 'viewCount', // Theo lượt xem
  NAME = 'name',          // Theo tên
}

/**
 * ProductQueryDto - DTO cho query parameters
 * 
 * Ví dụ request: GET /products?search=iphone&categoryId=1&minPrice=5000&maxPrice=20000&sortBy=price&sortOrder=ASC&page=1&limit=12
 */
export class ProductQueryDto {
  // ============ SEARCH ============
  /** Từ khóa tìm kiếm (tìm trong name, brand, sku, description) */
  @IsOptional()
  @IsString()
  search?: string;

  // ============ FILTERS ============
  /** Lọc theo ID danh mục */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  categoryId?: number;

  /** Lọc theo thương hiệu */
  @IsOptional()
  @IsString()
  brand?: string;

  /** Lọc theo màu sắc */
  @IsOptional()
  @IsString()
  color?: string;

  /** Lọc theo kích cỡ */
  @IsOptional()
  @IsString()
  size?: string;

  /** Giá tối thiểu */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  /** Giá tối đa */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  maxPrice?: number;

  // ============ PAGINATION ============
  /** Số trang (mặc định: 1) */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  /** Số items mỗi trang (mặc định: 12, tối đa: 100) */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 12;

  // ============ SORT ============
  /** Trường để sắp xếp (mặc định: createdAt - mới nhất) */
  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy = SortBy.CREATED_AT;

  /** Thứ tự sắp xếp (mặc định: DESC - giảm dần) */
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  // ============ ADDITIONAL FILTERS ============
  /** Chỉ hiển thị sản phẩm còn hàng */
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  inStock?: boolean;

  /** Chỉ hiển thị sản phẩm đang hoạt động (mặc định: true) */
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean = true;
}
