import { Body, Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendResetPasswordEmailDto } from './dto/send-reset-password-email.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  @Post('email/reset-password')
  async sendResetPasswordEmail(
    @Headers('x-internal-service-key') serviceKey: string,
    @Body() dto: SendResetPasswordEmailDto,
  ) {
    this.assertInternalService(serviceKey);
    await this.notificationsService.sendResetPasswordEmail(dto.to, dto.resetLink);
    return { sent: true };
  }

  @Post('email/order-confirmation')
  async sendOrderConfirmationEmail(
    @Headers('x-internal-service-key') serviceKey: string,
    @Body() dto: { to: string; orderNumber: string; total: number; status: string; paymentMethod: string },
  ) {
    this.assertInternalService(serviceKey);
    await this.notificationsService.sendOrderConfirmationEmail(dto);
    return { sent: true };
  }

  @Post('email/support-ticket')
  async sendSupportTicketEmail(
    @Headers('x-internal-service-key') serviceKey: string,
    @Body() dto: { fullName: string; email: string; subject: string; message: string; ticketId: string },
  ) {
    this.assertInternalService(serviceKey);
    await this.notificationsService.sendSupportTicketEmail(dto);
    return { sent: true };
  }

  private assertInternalService(serviceKey: string) {
    const expectedKey =
      this.configService.get<string>('INTERNAL_SERVICE_KEY') || 'local-dev-internal-key';
    if (!serviceKey || serviceKey !== expectedKey) {
      throw new UnauthorizedException('Invalid internal service key');
    }
  }
}
