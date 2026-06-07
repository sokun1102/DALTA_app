import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class UpdateCartDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity: number;
}
