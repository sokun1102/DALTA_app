import { Controller, Post, Body, UnauthorizedException, Get, BadRequestException } from '@nestjs/common';
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
    // 1. Kiểm tra xem email đã có người dùng chưa
    const existingUser = await this.usersService.findOneByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('Email này đã được sử dụng, vui lòng chọn email khác');
    }

    // 2. Nếu chưa có thì mới tiến hành băm mật khẩu và tạo
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
}

