import { Controller, Get } from '@nestjs/common';

@Controller()
export class GatewayController {
  @Get()
  health() {
    return {
      service: 'api-gateway',
      status: 'ok',
      routes: ['/auth', '/users', '/products', '/brands', '/categories', '/cart', '/orders'],
    };
  }
}
