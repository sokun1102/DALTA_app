import { Controller, Post, Body, UnauthorizedException, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service'; // Import thêm UsersService
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService // Inject vô
  ) {}

  // 1. API ĐĂNG KÝ (Tạo user để lấy chỗ chạy test)
  @Post('register')
  async register(@Body() body: any) {
    // Lưu ý: Thực tế cần check email đã tồn tại chưa, ở đây làm nhanh để test!
    const hashedPassword = await bcrypt.hash(body.password, 10);
    return this.usersService.create({
      email: body.email,
      password: hashedPassword,
    });
  }

  // 2. API ĐĂNG NHẬP
  @Post('login')
  async login(@Body() loginDto: Record<string, any>) {
    // Kiểm tra username, password
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // Trả về JWT
    return this.authService.login(user);
  }
}

