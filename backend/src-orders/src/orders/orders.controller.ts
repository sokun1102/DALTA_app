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
import { ConfigService } from '@nestjs/config';
import { Roles } from '../../../src-shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../src-shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../src-shared/guards/roles.guard';
import { UpdateAdminOrderDto } from './dto/admin-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { CreateGuestOrderDto, CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findMine(@Req() req) {
    return this.ordersService.findMine(req.user.userId);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAllForAdmin() {
    return this.ordersService.findAllForAdmin();
  }

  @Put('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateForAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminOrderDto,
    @Req() req,
  ) {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'N/A';
    const clientIp = Array.isArray(ip) ? ip[0] : ip;
    return this.ordersService.updateForAdmin(id, dto, req.user, clientIp);
  }

  @Get('internal/users/:userId/products/:productId/delivered')
  async hasUserDeliveredProduct(
    @Headers('x-internal-service-key') serviceKey: string,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    this.assertInternalService(serviceKey);
    return {
      eligible: await this.ordersService.hasUserDeliveredProduct(userId, productId),
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(req.user.userId, id);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  checkout(
    @Req() req,
    @Body() dto: CreateOrderDto,
    @Headers('authorization') authorization: string,
  ) {
    return this.ordersService.createFromCart(req.user.userId, dto, authorization, req.user.email);
  }

  @Post('guest-checkout')
  guestCheckout(@Body() dto: CreateGuestOrderDto) {
    return this.ordersService.createGuestOrder(dto);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  cancel(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() dto: CancelOrderDto) {
    return this.ordersService.cancel(req.user.userId, id, dto.reason);
  }

  @Delete(':id/history')
  @UseGuards(JwtAuthGuard)
  deleteFromHistory(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.ordersService.hideFromHistory(req.user.userId, id);
  }

  @Post('internal/stripe/checkout-completed')
  async markStripeCheckoutCompleted(
    @Headers('x-internal-service-key') serviceKey: string,
    @Body() body: { sessionId: string; paymentIntentId?: string | null },
  ) {
    this.assertInternalService(serviceKey);
    await this.ordersService.markStripeCheckoutCompleted(
      body.sessionId,
      body.paymentIntentId || null,
    );
    return { updated: true };
  }

  @Post('internal/:id/manual-payment-paid')
  async markManualPaymentPaid(
    @Headers('x-internal-service-key') serviceKey: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    this.assertInternalService(serviceKey);
    return this.ordersService.markManualPaymentPaid(id);
  }

  private assertInternalService(serviceKey: string) {
    const expectedKey =
      this.configService.get<string>('INTERNAL_SERVICE_KEY') || 'local-dev-internal-key';
    if (!serviceKey || serviceKey !== expectedKey) {
      throw new UnauthorizedException('Invalid internal service key');
    }
  }
}
