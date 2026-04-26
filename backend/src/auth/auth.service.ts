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
}
