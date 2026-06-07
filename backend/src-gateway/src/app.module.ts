import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GatewayController } from './gateway.controller';
import { GatewayAuthService } from './gateway-auth.service';
import { GatewayProxyService } from './gateway-proxy.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule.register({
      timeout: 15000,
      maxRedirects: 0,
    }),
    JwtModule.register({}),
  ],
  controllers: [GatewayController],
  providers: [GatewayProxyService, GatewayAuthService],
})
export class GatewayAppModule {}
