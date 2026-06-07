import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../src-shared/guards/jwt-auth.guard';
import { ProductsService } from './products.service';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findMine(@Req() req) {
    return this.productsService.findWishlist(req.user.userId);
  }

  @Post(':productId')
  add(@Param('productId', ParseIntPipe) productId: number, @Req() req) {
    return this.productsService.addToWishlist(req.user.userId, productId);
  }

  @Delete(':productId')
  remove(@Param('productId', ParseIntPipe) productId: number, @Req() req) {
    return this.productsService.removeFromWishlist(req.user.userId, productId);
  }
}
