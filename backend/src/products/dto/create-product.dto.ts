import { IsString, IsNumber, IsPositive, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'Tên sản phẩm phải là chuỗi ký tự' })
  @MinLength(3, { message: 'Tên sản phẩm phải có ít nhất 3 ký tự' })
  name: string;

  @IsNumber({}, { message: 'Giá sản phẩm phải là con số' })
  @IsPositive({ message: 'Giá sản phẩm phải lớn hơn 0' })
  price: number;
}
