/**
 * =====================================================
 * UPDATE PRODUCT DTO - Định nghĩa dữ liệu cập nhật sản phẩm
 * =====================================================
 * Kế thừa tất cả các trường từ CreateProductDto
 * Tất cả các trường đều optional vì khi cập nhật,
 * chỉ cần gửi những trường cần thay đổi
 */

import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

/**
 * UpdateProductDto kế thừa toàn bộ trường từ CreateProductDto
 * Nhưng tất cả đều optional (có thể có hoặc không)
 * 
 * Ví dụ: Chỉ muốn cập nhật giá -> chỉ gửi { "price": 999 }
 */
export class UpdateProductDto extends PartialType(CreateProductDto) {}
