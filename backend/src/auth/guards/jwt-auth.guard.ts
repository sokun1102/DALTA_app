import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Guard này sẽ tự động gắn chiến lược JwtStrategy (passport-jwt) cản request
}
