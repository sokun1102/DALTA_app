import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import type { SendResetPasswordEmailContract } from '../../src-shared/contracts';

@Injectable()
export class AuthService {
  private readonly notificationsServiceUrl: string;
  private readonly internalServiceKey: string;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.notificationsServiceUrl =
      this.configService.get<string>('NOTIFICATIONS_SERVICE_URL') || 'http://localhost:3007';
    this.internalServiceKey =
      this.configService.get<string>('INTERNAL_SERVICE_KEY') || 'local-dev-internal-key';
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async googleLogin(req) {
    if (!req.user) {
      return 'No user from google';
    }

    let user = await this.usersService.findOneByEmail(req.user.email);
    if (!user) {
      user = await this.usersService.create({
        email: req.user.email,
        fullName: req.user.fullName || req.user.firstName || req.user.email?.split('@')[0],
        password: '',
        role: 'user',
      } as any);
    }

    return this.login(user);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await this.usersService.update(user.id, {
      resetToken,
      resetTokenExpiry: expiry,
    } as any);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    await this.sendResetEmail(email, `${frontendUrl}/reset-password?token=${resetToken}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.usersService.findByResetToken(token);

    if (!user) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
    }

    if (new Date() > user.resetTokenExpiry) {
      throw new BadRequestException('Token đã hết hạn, vui lòng yêu cầu lại');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(user.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    } as any);
  }

  private async sendResetEmail(to: string, resetLink: string): Promise<void> {
    try {
      const payload: SendResetPasswordEmailContract = { to, resetLink };
      await this.httpService.axiosRef.post(
        `${this.notificationsServiceUrl}/notifications/email/reset-password`,
        payload,
        { headers: { 'x-internal-service-key': this.internalServiceKey } },
      );
    } catch {
      throw new ServiceUnavailableException('Dịch vụ gửi email đang không khả dụng');
    }
  }
}
