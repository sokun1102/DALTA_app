import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateReviewVisibilityDto {
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}
