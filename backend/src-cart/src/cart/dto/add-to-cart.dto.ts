import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class AddToCartDto {
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  productId: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  size?: string;
}
