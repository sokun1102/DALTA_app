import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    // So sánh mật khẩu bằng bcrypt
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result; // Loại bỏ password trước khi trả về
    }
    return null;
  }

  async login(user: any) {
    // Đóng gói thông tin (payload) vào JWT (Token)
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload), // Cấp token tại đây
    };
  }

  async googleLogin(req) {
    if (!req.user) {
      return 'No user from google';
    }

    // Kiểm tra xem user này đã có trong DB chưa
    let user = await this.usersService.findOneByEmail(req.user.email);

    if (!user) {
      // Nếu chưa có thì tạo mới (đăng ký tự động)
      user = await this.usersService.create({
        email: req.user.email,
        password: '', // Không cần mật khẩu vì đăng nhập qua Google
        role: 'user',
      } as any);
    }

    // Trả về Token của hệ thống mình (để dùng cho các API khác)
    return this.login(user);
  }
}
