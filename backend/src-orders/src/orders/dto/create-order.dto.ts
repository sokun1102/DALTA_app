import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  addressId?: number;

  @ValidateIf((dto) => !dto.addressId)
  @IsObject()
  shippingAddress?: Record<string, string>;

  @IsIn(['standard', 'express'])
  shippingMethod: string;

  @IsIn(['cod', 'card', 'bank_transfer'])
  paymentMethod: string;

  @IsOptional()
  @IsString()
  voucherCode?: string;
}

export class GuestOrderItemDto {
  @IsNumber()
  @IsPositive()
  productId: number;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  selectedColor?: string;

  @IsOptional()
  @IsString()
  selectedSize?: string;
}

export class CreateGuestOrderDto extends CreateOrderDto {
  @IsEmail()
  guestEmail: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => GuestOrderItemDto)
  items: GuestOrderItemDto[];
}
