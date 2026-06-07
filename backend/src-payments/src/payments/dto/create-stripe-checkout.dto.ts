import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import type {
  CreateStripeCheckoutContract,
  StripeCheckoutItemContract,
  StripeCheckoutOrderContract,
} from '../../../../src-shared/contracts';

class CheckoutOrderDto implements StripeCheckoutOrderContract {
  @IsNumber()
  id: number;

  @IsString()
  orderNumber: string;

  @IsNumber()
  userId: number;

  @IsNumber()
  shippingFee: number;

  @IsNumber()
  tax: number;
}

class CheckoutItemDto implements StripeCheckoutItemContract {
  @IsString()
  productName: string;

  @IsOptional()
  @IsString()
  productImage?: string | null;

  @IsNumber()
  price: number;

  @IsNumber()
  quantity: number;
}

export class CreateStripeCheckoutDto implements CreateStripeCheckoutContract {
  @ValidateNested()
  @Type(() => CheckoutOrderDto)
  order: CheckoutOrderDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];
}
