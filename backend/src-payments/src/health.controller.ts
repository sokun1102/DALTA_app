import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get()
  root() {
    return 'Payments Service is running!';
  }

  @Get('health')
  health() {
    return { status: 'ok', service: 'payments' };
  }
}
