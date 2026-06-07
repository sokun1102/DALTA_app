import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UsersService } from '../users/users.service';
import axios from 'axios';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const existingUser = await this.usersService.findOneByEmail(registerDto.email);

    if (existingUser) {
      if (existingUser.password && existingUser.password !== '') {
        throw new BadRequestException('Email này đã được đăng ký');
      }

      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      const user = await this.usersService.update(existingUser.id, {
        fullName: registerDto.fullName || existingUser.fullName,
        password: hashedPassword,
      } as any);
      return this.toSafeUser(user);
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      fullName: registerDto.fullName,
      email: registerDto.email,
      password: hashedPassword,
    });

    // Log registration action to audit logs
    const ordersServiceUrl = this.configService.get<string>('ORDERS_SERVICE_URL') || 'http://localhost:3003';
    const internalKey = this.configService.get<string>('INTERNAL_SERVICE_KEY') || 'local-dev-internal-key';
    try {
      await axios.post(
        `${ordersServiceUrl}/settings/audit-logs/internal`,
        {
          user: { userId: user.id, email: user.email },
          action: 'Đăng ký tài khoản',
          details: `Thành viên mới ${user.fullName} (${user.email}) đăng ký tài khoản thành công.`,
          ip: 'N/A',
          type: 'SYSTEM',
        },
        { headers: { 'x-internal-service-key': internalKey } },
      );
    } catch (err) {
      console.warn('Failed to log user registration internally:', err.message);
    }

    return this.toSafeUser(user);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    return this.authService.login(user);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const result = await this.authService.googleLogin(req);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';

    if (typeof result === 'object' && result.access_token) {
      return res.redirect(`${frontendUrl}?authToken=${result.access_token}`);
    }

    return res.redirect(`${frontendUrl}?error=login_failed`);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
    return { message: 'Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi.' };
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.newPassword);
    return { message: 'Đặt lại mật khẩu thành công.' };
  }

  private toSafeUser(user: any) {
    if (!user) return user;
    const { password, resetToken, resetTokenExpiry, ...safeUser } = user;
    return safeUser;
  }
}
