import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateStripeCheckoutDto } from './dto/create-stripe-checkout.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService,
  ) {}

  @Post('stripe/checkout')
  createStripeCheckout(
    @Headers('x-internal-service-key') serviceKey: string,
    @Body() dto: CreateStripeCheckoutDto,
  ) {
    this.assertInternalService(serviceKey);
    return this.paymentsService.createStripeCheckoutSession(dto.order, dto.items);
  }

  @Post('stripe/webhook')
  async stripeWebhook(@Req() req, @Headers('stripe-signature') signature: string) {
    try {
      await this.paymentsService.handleStripeWebhook(req.rawBody, signature);
    } catch (error) {
      throw new BadRequestException(`Webhook signature verification failed: ${error.message}`);
    }

    return { received: true };
  }

  private assertInternalService(serviceKey: string) {
    const expectedKey =
      this.configService.get<string>('INTERNAL_SERVICE_KEY') || 'local-dev-internal-key';
    if (!serviceKey || serviceKey !== expectedKey) {
      throw new UnauthorizedException('Invalid internal service key');
    }
  }
}
