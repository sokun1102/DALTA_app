/**
 * =====================================================
 * CREATE PRODUCT DTO - Định nghĩa dữ liệu tạo sản phẩm mới
 * =====================================================
 * File này định nghĩa cấu trúc dữ liệu khi tạo sản phẩm mới
 * Sử dụng class-validator để validate dữ liệu đầu vào
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

/**
 * DTO cho hình ảnh sản phẩm
 */
export class ProductImageDto {
  /** URL của hình ảnh */
  @IsString()
  url: string;

  /** Có phải là hình ảnh chính không (mặc định: false) */
  @IsOptional()
  isPrimary?: boolean;

  /** Thứ tự hiển thị (mặc định: theo index) */
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  /** Văn bản thay thế cho ảnh (alt text) */
  @IsOptional()
  @IsString()
  altText?: string;
}

/**
 * CreateProductDto - DTO tạo sản phẩm
 * 
 * Tất cả các trường đều là optional TRỪ name và price
 */
export class CreateProductDto {
  // ============ THÔNG TIN CƠ BẢN (BẮT BUỘC) ============
  /** Tên sản phẩm (bắt buộc, tối thiểu 3 ký tự) */
  @IsString({ message: 'Tên sản phẩm phải là chuỗi ký tự' })
  @MinLength(3, { message: 'Tên sản phẩm phải có ít nhất 3 ký tự' })
  name: string;

  /** Giá sản phẩm (bắt buộc, phải > 0) */
  @IsNumber({}, { message: 'Giá sản phẩm phải là con số' })
  @IsPositive({ message: 'Giá sản phẩm phải lớn hơn 0' })
  price: number;

  // ============ THÔNG TIN GIÁ ============
  /** Giá gốc (trước khuyến mãi) - optional */
  @IsOptional()
  @IsNumber({}, { message: 'Giá gốc phải là con số' })
  @IsPositive({ message: 'Giá gốc phải lớn hơn 0' })
  originalPrice?: number;

  // ============ MÔ TẢ ============
  /** Mô tả chi tiết sản phẩm */
  @IsOptional()
  @IsString()
  description?: string;

  /** Thương hiệu (VD: Apple, Samsung) */
  @IsOptional()
  @IsString()
  brand?: string;

  /** Mã sản phẩm (SKU - Stock Keeping Unit) */
  @IsOptional()
  @IsString()
  sku?: string;

  // ============ TỒN KHO ============
  /** Số lượng trong kho (mặc định: 0) */
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  // ============ ĐÁNH GIÁ ============
  /** Điểm đánh giá (0-5 sao) */
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  /** Số lượng đánh giá */
  @IsOptional()
  @IsNumber()
  @Min(0)
  reviewCount?: number;

  /** Số lượng đã bán */
  @IsOptional()
  @IsNumber()
  @Min(0)
  soldCount?: number;

  // ============ THÔNG SỐ KỸ THUẬT ============
  /** Thông số kỹ thuật (lưu dạng JSON, VD: { "CPU": "Intel i7", "RAM": "16GB" }) */
  @IsOptional()
  @IsObject()
  specifications?: Record<string, string>;

  /** Màu sắc sản phẩm (VD: đỏ, xanh, đen) */
  @IsOptional()
  @IsString()
  color?: string;

  /** Kích cỡ sản phẩm (VD: S, M, L, XL) */
  @IsOptional()
  @IsString()
  size?: string;

  /** Trọng lượng sản phẩm (VD: "500g") */
  @IsOptional()
  @IsString()
  weight?: string;

  // ============ LIÊN KẾT ============
  /** ID danh mục sản phẩm thuộc về */
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  // ============ TAG ============
  /** Danh sách tags cho sản phẩm */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  // ============ HÌNH ẢNH ============
  /** Danh sách hình ảnh sản phẩm */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];
}
