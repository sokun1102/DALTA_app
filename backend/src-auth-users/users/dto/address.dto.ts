import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class AddressDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Tên người nhận phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên người nhận là bắt buộc' })
  @MinLength(2, { message: 'Tên người nhận phải có ít nhất 2 ký tự' })
  @MaxLength(80, { message: 'Tên người nhận không được vượt quá 80 ký tự' })
  fullName: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(/^[0-9+\-\s()]{8,20}$/, { message: 'Số điện thoại không hợp lệ' })
  phone: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Địa chỉ phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Địa chỉ là bắt buộc' })
  @MaxLength(255, { message: 'Địa chỉ không được vượt quá 255 ký tự' })
  street: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Thành phố/Tỉnh phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Thành phố/Tỉnh là bắt buộc' })
  @MaxLength(120, { message: 'Thành phố/Tỉnh không được vượt quá 120 ký tự' })
  city: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Quận/Huyện phải là chuỗi ký tự' })
  @MaxLength(120, { message: 'Quận/Huyện không được vượt quá 120 ký tự' })
  district?: string;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái mặc định phải là true hoặc false' })
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Tên người nhận phải là chuỗi ký tự' })
  @MinLength(2, { message: 'Tên người nhận phải có ít nhất 2 ký tự' })
  @MaxLength(80, { message: 'Tên người nhận không được vượt quá 80 ký tự' })
  fullName?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(/^[0-9+\-\s()]{8,20}$/, { message: 'Số điện thoại không hợp lệ' })
  phone?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Địa chỉ phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Địa chỉ không được vượt quá 255 ký tự' })
  street?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Thành phố/Tỉnh phải là chuỗi ký tự' })
  @MaxLength(120, { message: 'Thành phố/Tỉnh không được vượt quá 120 ký tự' })
  city?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Quận/Huyện phải là chuỗi ký tự' })
  @MaxLength(120, { message: 'Quận/Huyện không được vượt quá 120 ký tự' })
  district?: string;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái mặc định phải là true hoặc false' })
  isDefault?: boolean;
}
