import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Ho ten phai la chuoi ky tu' })
  @MinLength(2, { message: 'Ho ten phai co it nhat 2 ky tu' })
  @MaxLength(80, { message: 'Ho ten khong duoc vuot qua 80 ky tu' })
  @Matches(/^[\p{L}\s'.-]+$/u, {
    message: 'Ho ten chi duoc chua chu cai, khoang trang va dau phan cach hop le',
  })
  fullName?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(/^[0-9+\-\s()]{8,20}$/, { message: 'So dien thoai khong hop le' })
  phone?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Ngay sinh khong dung dinh dang' })
  birthDate?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsUrl({}, { message: 'Anh dai dien phai la URL hop le' })
  avatar?: string;

  @IsOptional()
  @IsIn(['cod', 'card', 'bank_transfer'], {
    message: 'Phuong thuc thanh toan mac dinh khong hop le',
  })
  defaultPaymentMethod?: string;
}
