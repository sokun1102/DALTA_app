import { IsBoolean, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';

export class PaymentMethodsDto {
  @IsOptional()
  @IsBoolean()
  cod?: boolean;

  @IsOptional()
  @IsBoolean()
  card?: boolean;

  @IsOptional()
  @IsBoolean()
  bank_transfer?: boolean;
}

export class ShippingFeesDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  standard?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  express?: number;
}

export class BankTransferSettingsDto {
  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankFullName?: string;

  @IsOptional()
  @IsString()
  bankBin?: string;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsString()
  accountName?: string;
}

export class CheckoutSettingsDto {
  @IsOptional()
  @IsObject()
  paymentMethods?: PaymentMethodsDto;

  @IsOptional()
  @IsObject()
  shippingFees?: ShippingFeesDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @IsOptional()
  @IsObject()
  bankTransfer?: BankTransferSettingsDto;
}
