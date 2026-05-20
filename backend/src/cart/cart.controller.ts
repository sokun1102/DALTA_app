import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req) {
    return this.cartService.getCart(req.user.userId);
  }

  @Post()
  addToCart(@Req() req, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(req.user.userId, dto);
  }

  @Put(':id')
  updateCartItem(@Req() req, @Param('id') id: string, @Body() dto: UpdateCartDto) {
    return this.cartService.updateCartItem(req.user.userId, +id, dto);
  }

  @Delete(':id')
  removeFromCart(@Req() req, @Param('id') id: string) {
    return this.cartService.removeFromCart(req.user.userId, +id);
  }

  @Delete()
  clearCart(@Req() req) {
    return this.cartService.clearCart(req.user.userId);
  }
}
