import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { GatewayAppModule } from './app.module';
import { GatewayAuthService } from './gateway-auth.service';
import { GatewayProxyService } from './gateway-proxy.service';

async function bootstrap() {
  const app = await NestFactory.create(GatewayAppModule, { rawBody: true });
  const auth = app.get(GatewayAuthService);
  const proxy = app.get(GatewayProxyService);

  app.enableCors();
  app.use(json({
    verify: (req: any, _res, buffer) => {
      req.rawBody = Buffer.from(buffer);
    },
  }));
  app.use(urlencoded({ extended: true }));

  app.use((req, res) => {
    if (req.path === '/' || req.path === '/health') {
      res.status(200).json({
        service: 'api-gateway',
        status: 'ok',
        routes: ['/auth', '/users', '/products', '/brands', '/categories', '/cart', '/orders'],
      });
      return;
    }

    if (!auth.verifyRequest(req, res)) return;

    proxy.forward(req, res).catch((error) => {
      const status = error?.response?.status || 502;
      const data = error?.response?.data || {
        message: 'Gateway could not reach target service',
      };
      res.status(status).send(data);
    });
  });

  const port = process.env.GATEWAY_PORT || 3005;
  await app.listen(port);
  console.log(`API Gateway running on port ${port}`);
}

bootstrap();
