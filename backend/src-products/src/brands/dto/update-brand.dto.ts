/**
 * =====================================================
 * UPDATE BRAND DTO - Dữ liệu cập nhật thương hiệu
 * =====================================================
 */

import { PartialType } from '@nestjs/mapped-types';
import { CreateBrandDto } from './create-brand.dto';

export class UpdateBrandDto extends PartialType(CreateBrandDto) {}
