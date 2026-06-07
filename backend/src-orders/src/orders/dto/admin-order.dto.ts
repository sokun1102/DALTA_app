import { IsIn, IsOptional } from 'class-validator';

export class UpdateAdminOrderDto {
  @IsOptional()
  @IsIn(['PENDING', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED'])
  status?: string;

  @IsOptional()
  @IsIn(['PENDING', 'UNPAID', 'PAID', 'FAILED', 'REFUNDED'])
  paymentStatus?: string;
}
