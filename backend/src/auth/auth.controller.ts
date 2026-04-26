import { Controller, Post, Body, UnauthorizedException, Get, BadRequestException, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService // Inject vô
  ) {}

  // 1. API ĐĂNG KÝ (Tạo user để lấy chỗ chạy test)
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    // 1. Kiểm tra xem email đã có trong hệ thống chưa
    const existingUser = await this.usersService.findOneByEmail(registerDto.email);
    
    if (existingUser) {
      // Nếu đã có mật khẩu rồi (đã đăng ký trước đó) -> Chặn lại
      if (existingUser.password && existingUser.password !== '') {
        throw new BadRequestException('Email này đã được sử dụng, vui lòng chọn email khác');
      }
      
      // Nếu chưa có mật khẩu (tạo từ Google) -> Cho phép cập nhật mật khẩu
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      return this.usersService.update(existingUser.id, {
        password: hashedPassword
      } as any);
    }

    // 2. Nếu hoàn toàn chưa có email này -> Tạo mới
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    return this.usersService.create({
      email: registerDto.email,
      password: hashedPassword,
    });
  }

  // 2. API ĐĂNG NHẬP
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // Kiểm tra username, password
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // Trả về JWT
    return this.authService.login(user);
  }

  // 3. ĐĂNG NHẬP GOOGLE
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const result = await this.authService.googleLogin(req);
    
    // Kiểm tra nếu là object chứa token thì mới redirect
    if (typeof result === 'object' && result.access_token) {
      return res.redirect(`http://localhost:5173?token=${result.access_token}`);
    }
    
    // Nếu có lỗi thì về trang chủ kèm thông báo lỗi
    return res.redirect(`http://localhost:5173?error=login_failed`);
  }
}

