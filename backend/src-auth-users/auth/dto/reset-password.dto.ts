import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString({ message: 'Token đặt lại mật khẩu phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Token đặt lại mật khẩu là bắt buộc' })
  token: string;

  @IsString({ message: 'Mật khẩu mới phải là chuỗi ký tự' })
  @MinLength(8, { message: 'Mật khẩu mới phải có ít nhất 8 ký tự' })
  newPassword: string;
}
