import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CancelOrderDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(5, { message: 'Cancel reason must have at least 5 characters' })
  @MaxLength(500, { message: 'Cancel reason must not exceed 500 characters' })
  reason: string;
}
