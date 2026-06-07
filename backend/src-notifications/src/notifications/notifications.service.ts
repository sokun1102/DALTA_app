import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import axios from 'axios';

@Injectable()
export class NotificationsService {
  constructor(private readonly configService: ConfigService) {}

  private async logMailStatus(
    to: string,
    subject: string,
    status: 'SENT' | 'PENDING' | 'FAILED',
    error?: string,
  ): Promise<void> {
    const ordersServiceUrl = this.configService.get<string>('ORDERS_SERVICE_URL') || 'http://localhost:3003';
    const internalKey = this.configService.get<string>('INTERNAL_SERVICE_KEY') || 'local-dev-internal-key';
    try {
      await axios.post(
        `${ordersServiceUrl}/settings/mail-logs/internal`,
        { to, subject, status, error },
        { headers: { 'x-internal-service-key': internalKey } },
      );
    } catch (err) {
      console.warn('Failed to log mail status internally:', err.message);
    }
  }

  async sendResetPasswordEmail(to: string, resetLink: string): Promise<void> {
    const mailUser = this.configService.get<string>('MAIL_USER');
    const mailPass = this.configService.get<string>('MAIL_PASS');
    const subject = 'Đặt lại mật khẩu AEROTEC';

    if (!mailUser || !mailPass) {
      await this.logMailStatus(to, subject, 'PENDING', 'Chưa cấu hình tài khoản SMTP (MAIL_USER/MAIL_PASS) trong tệp .env');
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: mailUser,
        pass: mailPass,
      },
    });

    try {
      await transporter.sendMail({
        from: `"AEROTEC Shop" <${mailUser}>`,
        to,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
            <h2 style="color: #e11d48;">AEROTEC</h2>
            <p>Bạn đã yêu cầu đặt lại mật khẩu tài khoản.</p>
            <p>Bấm vào nút bên dưới để đặt lại mật khẩu. Link có hiệu lực trong 15 phút.</p>
            <a href="${resetLink}" style="
              display: inline-block; padding: 12px 24px;
              background: #e11d48; color: #fff;
              text-decoration: none; border-radius: 6px; font-weight: bold;
            ">Đặt lại mật khẩu</a>
            <p style="color: #999; margin-top: 20px; font-size: 12px;">
              Nếu bạn không yêu cầu, hãy bỏ qua email này.
            </p>
          </div>
        `,
      });
      await this.logMailStatus(to, subject, 'SENT');
    } catch (err) {
      await this.logMailStatus(to, subject, 'FAILED', err.message);
      throw err;
    }
  }

  async sendOrderConfirmationEmail(dto: {
    to: string;
    orderNumber: string;
    total: number;
    status: string;
    paymentMethod: string;
  }): Promise<void> {
    const mailUser = this.configService.get<string>('MAIL_USER');
    const mailPass = this.configService.get<string>('MAIL_PASS');
    const subject = `AEROTEC đã ghi nhận đơn hàng ${dto.orderNumber}`;

    if (!mailUser || !mailPass) {
      await this.logMailStatus(dto.to, subject, 'PENDING', 'Chưa cấu hình tài khoản SMTP (MAIL_USER/MAIL_PASS) trong tệp .env');
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: mailUser,
        pass: mailPass,
      },
    });

    try {
      await transporter.sendMail({
        from: `"AEROTEC" <${mailUser}>`,
        to: dto.to,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; color: #111827;">
            <h2 style="color: #e11d48;">AEROTEC</h2>
            <p>Đơn hàng <strong>${dto.orderNumber}</strong> đã được hệ thống ghi nhận.</p>
            <p><strong>Trạng thái:</strong> ${dto.status}</p>
            <p><strong>Thanh toán:</strong> ${dto.paymentMethod}</p>
            <p><strong>Tổng tiền:</strong> ${Number(dto.total || 0).toLocaleString('vi-VN')} VND</p>
            <p>Bạn có thể theo dõi đơn hàng trong trang Đơn hàng của tài khoản.</p>
          </div>
        `,
      });
      await this.logMailStatus(dto.to, subject, 'SENT');
    } catch (err) {
      await this.logMailStatus(dto.to, subject, 'FAILED', err.message);
      // Fail silently for orders flow to not block checkout
    }
  }

  async sendSupportTicketEmail(dto: {
    fullName: string;
    email: string;
    subject: string;
    message: string;
    ticketId: string;
  }): Promise<void> {
    const mailUser = this.configService.get<string>('MAIL_USER');
    const mailPass = this.configService.get<string>('MAIL_PASS');
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL') || 'admin@mail.com';
    const clientSubject = `[AEROTEC Support] Yêu cầu hỗ trợ #${dto.ticketId} đã được tiếp nhận`;
    const adminSubject = `[Yêu cầu hỗ trợ mới] #${dto.ticketId} - ${dto.fullName}`;

    if (!mailUser || !mailPass) {
      await this.logMailStatus(dto.email, clientSubject, 'PENDING', 'Chưa cấu hình tài khoản SMTP (MAIL_USER/MAIL_PASS) trong tệp .env');
      await this.logMailStatus(adminEmail, adminSubject, 'PENDING', 'Chưa cấu hình tài khoản SMTP (MAIL_USER/MAIL_PASS) trong tệp .env');
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: mailUser,
        pass: mailPass,
      },
    });

    // 1. Send confirmation email to customer
    try {
      await transporter.sendMail({
        from: `"AEROTEC Support" <${mailUser}>`,
        to: dto.email,
        subject: clientSubject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; color: #111827; border: 1px solid #e5e7eb; padding: 24px; border-radius: 8px;">
            <h2 style="color: #e11d48; margin-top: 0; font-weight: bold; letter-spacing: 1px;">AEROTEC</h2>
            <p>Xin chào <strong>${dto.fullName}</strong>,</p>
            <p>Cảm ơn bạn đã liên hệ với bộ phận chăm sóc khách hàng của AEROTEC. Chúng tôi đã nhận được yêu cầu hỗ trợ của bạn:</p>
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; margin: 16px 0;">
              <p style="margin: 4px 0;"><strong>Mã Ticket:</strong> #${dto.ticketId}</p>
              <p style="margin: 4px 0;"><strong>Chủ đề:</strong> ${dto.subject}</p>
              <p style="margin: 4px 0;"><strong>Nội dung:</strong> ${dto.message}</p>
            </div>
            <p>Đội ngũ hỗ trợ kỹ thuật của chúng tôi sẽ phản hồi bạn sớm nhất có thể (thường trong vòng 24 giờ làm việc).</p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="font-size: 12px; color: #6b7280; text-align: center;">Đây là email tự động từ hệ thống AEROTEC, vui lòng không trả lời trực tiếp email này.</p>
          </div>
        `,
      });
      await this.logMailStatus(dto.email, clientSubject, 'SENT');
    } catch (err) {
      await this.logMailStatus(dto.email, clientSubject, 'FAILED', err.message);
    }

    // 2. Send notification email to admin
    try {
      await transporter.sendMail({
        from: `"AEROTEC System" <${mailUser}>`,
        to: adminEmail,
        subject: adminSubject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; color: #111827; border: 1px solid #e5e7eb; padding: 24px; border-radius: 8px;">
            <h2 style="color: #1e3a8a; margin-top: 0;">Yêu cầu hỗ trợ mới</h2>
            <p>Một yêu cầu hỗ trợ mới vừa được gửi từ website:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; width: 120px;">Họ tên:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${dto.fullName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Email:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${dto.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Chủ đề:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${dto.subject}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; vertical-align: top;">Nội dung:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; white-space: pre-wrap;">${dto.message}</td>
              </tr>
            </table>
            <p>Vui lòng đăng nhập vào trang quản trị để xem và quản lý yêu cầu hỗ trợ này.</p>
          </div>
        `,
      });
      await this.logMailStatus(adminEmail, adminSubject, 'SENT');
    } catch (err) {
      await this.logMailStatus(adminEmail, adminSubject, 'FAILED', err.message);
    }
  }
}
