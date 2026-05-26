import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && await bcrypt.compare(pass, user.password)) {
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
        password: '',
        role: 'user',
      } as any);
    }
    return this.login(user);
  }

  // Gửi email reset password
  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      // Không báo lỗi để tránh lộ thông tin email tồn tại hay không
      return;
    }

    // Tạo token ngẫu nhiên
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // hết hạn sau 15 phút

    // Lưu token vào DB
    await this.usersService.update(user.id, {
      resetToken,
      resetTokenExpiry: expiry,
    } as any);

    // Gửi email
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
    await this.sendResetEmail(email, resetLink);
  }

  // Đặt lại mật khẩu mới
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

  // Gửi email qua nodemailer
  private async sendResetEmail(to: string, resetLink: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"DALTA Shop" <${process.env.MAIL_USER}>`,
      to,
      subject: 'Đặt lại mật khẩu DALTA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
          <h2 style="color: #1a3de4;">DALTA Shop</h2>
          <p>Bạn đã yêu cầu đặt lại mật khẩu.</p>
          <p>Bấm vào nút bên dưới để đặt lại mật khẩu (có hiệu lực trong 15 phút):</p>
          <a href="${resetLink}" style="
            display: inline-block; padding: 12px 24px;
            background: #1a3de4; color: #fff;
            text-decoration: none; border-radius: 6px; font-weight: bold;
          ">Đặt lại mật khẩu</a>
          <p style="color: #999; margin-top: 20px; font-size: 12px;">
            Nếu bạn không yêu cầu, hãy bỏ qua email này.
          </p>
        </div>
      `,
    });
  }
}
