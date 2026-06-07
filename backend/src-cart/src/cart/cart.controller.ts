import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from '../../../src-shared/guards/jwt-auth.guard';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getCart(@Req() req) {
    return this.cartService.getCart(req.user.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  addToCart(@Req() req, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(req.user.userId, dto);
  }

  @Delete('internal/users/:userId')
  clearCartForService(
    @Param('userId', ParseIntPipe) userId: number,
    @Headers('x-internal-service-key') serviceKey: string,
  ) {
    const expectedKey =
      process.env.INTERNAL_SERVICE_KEY || 'local-dev-internal-key';

    if (serviceKey !== expectedKey) {
      throw new UnauthorizedException('Invalid internal service key');
    }

    return this.cartService.clearCart(userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  updateCartItem(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCartDto,
  ) {
    return this.cartService.updateCartItem(req.user.userId, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  removeFromCart(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.cartService.removeFromCart(req.user.userId, id);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  clearCart(@Req() req) {
    return this.cartService.clearCart(req.user.userId);
  }
}
