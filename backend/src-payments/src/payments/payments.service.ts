import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import type {
  StripeCheckoutItemContract,
  StripeCheckoutOrderContract,
  StripeCheckoutResponseContract,
} from '../../../src-shared/contracts';

@Injectable()
export class PaymentsService {
  private readonly ordersServiceUrl: string;
  private readonly internalServiceKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.ordersServiceUrl =
      this.configService.get<string>('ORDERS_SERVICE_URL') || 'http://localhost:3003';
    this.internalServiceKey =
      this.configService.get<string>('INTERNAL_SERVICE_KEY') || 'local-dev-internal-key';
  }

  async createStripeCheckoutSession(
    order: StripeCheckoutOrderContract,
    items: StripeCheckoutItemContract[],
  ): Promise<StripeCheckoutResponseContract> {
    const stripe = this.createClient();
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const lineItems = items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: 'vnd',
        unit_amount: Math.round(Number(item.price)),
        product_data: {
          name: item.productName,
          images: this.getStripeProductImages(item.productImage),
        },
      },
    }));

    if (Number(order.shippingFee) > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: 'vnd',
          unit_amount: Math.round(Number(order.shippingFee)),
          product_data: { name: 'Shipping fee', images: undefined },
        },
      });
    }

    if (Number(order.tax) > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: 'vnd',
          unit_amount: Math.round(Number(order.tax)),
          product_data: { name: 'Tax', images: undefined },
        },
      });
    }

    return stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      client_reference_id: order.orderNumber,
      metadata: {
        orderId: String(order.id),
        orderNumber: order.orderNumber,
        userId: String(order.userId),
      },
      success_url: `${frontendUrl}/checkout?checkout=success&order=${order.orderNumber}`,
      cancel_url: `${frontendUrl}/checkout?checkout=cancelled&order=${order.orderNumber}`,
    });
  }

  async handleStripeWebhook(rawBody: Buffer, signature: string): Promise<void> {
    const event = this.constructWebhookEvent(rawBody, signature);
    if (event.type !== 'checkout.session.completed') return;

    const session = event.data.object;
    await this.markOrderCheckoutCompleted(
      session.id,
      typeof session.payment_intent === 'string' ? session.payment_intent : null,
    );
  }

  private constructWebhookEvent(rawBody: Buffer, signature: string): { type: string; data: { object: any } } {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new BadRequestException('Stripe webhook is not configured');
    }

    return this.createClient().webhooks.constructEvent(rawBody, signature, webhookSecret);
  }

  private async markOrderCheckoutCompleted(
    sessionId: string,
    paymentIntentId?: string | null,
  ): Promise<void> {
    try {
      await this.httpService.axiosRef.post(
        `${this.ordersServiceUrl}/orders/internal/stripe/checkout-completed`,
        { sessionId, paymentIntentId },
        { headers: { 'x-internal-service-key': this.internalServiceKey } },
      );
    } catch {
      throw new ServiceUnavailableException('Orders Service is unavailable');
    }
  }

  private createClient() {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new BadRequestException('Stripe is not configured');
    }

    return new Stripe(secretKey);
  }

  private getStripeProductImages(image?: string | null): string[] | undefined {
    if (!image) return undefined;

    const imageUrl = image.trim();
    try {
      const parsed = new URL(imageUrl);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return [imageUrl];
      }
    } catch {
      return undefined;
    }

    return undefined;
  }
}
