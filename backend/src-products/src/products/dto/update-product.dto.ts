/**
 * =====================================================
 * UPDATE PRODUCT DTO - Dữ liệu cập nhật sản phẩm
 * =====================================================
 */

import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
