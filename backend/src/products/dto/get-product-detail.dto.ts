/**
 * =====================================================
 * GET PRODUCT DETAIL DTO - Định nghĩa params cho chi tiết sản phẩm
 * =====================================================
 * DTO đơn giản cho việc lấy chi tiết một sản phẩm theo ID
 */

import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO cho params lấy chi tiết sản phẩm
 */
export class GetProductDetailDto {
  /** ID của sản phẩm cần lấy (phải >= 1) */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  id?: number;
}
