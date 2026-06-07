import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../src-shared/guards/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { ProductsService } from './products.service';

@Controller('products/:productId/reviews')
export class ReviewsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.productsService.findReviews(productId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: CreateReviewDto,
    @Req() req,
  ) {
    return this.productsService.createReview(productId, req.user, dto);
  }
}
