import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // Token sẽ được lấy từ Header Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Báo lỗi nếu token hết hạn
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  // Hàm này chạy SAU khi token hợp lệ và giải mã thành công payload
  async validate(payload: any) {
    // Trả về thông tin nào bạn muốn nhét vào biến request.user
    return { userId: payload.sub, email: payload.email };
  }
}
