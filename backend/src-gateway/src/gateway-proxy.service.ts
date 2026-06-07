import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { Request, Response } from 'express';

type RouteTarget = {
  prefixes: string[];
  target: string;
};

@Injectable()
export class GatewayProxyService {
  private readonly logger = new Logger(GatewayProxyService.name);

  private readonly routes: RouteTarget[] = [
    {
      prefixes: ['/auth', '/users'],
      target: process.env.AUTH_USERS_SERVICE_URL || 'http://localhost:3000',
    },
    {
      prefixes: ['/products', '/brands', '/wishlist', '/articles'],
      target: process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3001',
    },
    {
      prefixes: ['/categories'],
      target: process.env.CATEGORIES_SERVICE_URL || 'http://localhost:3002',
    },
    {
      prefixes: ['/orders', '/settings'],
      target: process.env.ORDERS_SERVICE_URL || 'http://localhost:3003',
    },
    {
      prefixes: ['/cart'],
      target: process.env.CART_SERVICE_URL || 'http://localhost:3004',
    },
    {
      prefixes: ['/payments'],
      target: process.env.PAYMENTS_SERVICE_URL || 'http://localhost:3006',
    },
    {
      prefixes: ['/notifications'],
      target: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3007',
    },
  ];

  constructor(private readonly httpService: HttpService) {}

  async forward(req: Request & { rawBody?: Buffer }, res: Response) {
    const target = this.resolveTarget(req.path);
    const targetUrl = `${target}${req.originalUrl}`;
    const headers = this.buildHeaders(req);
    const data = this.getRequestBody(req);
    const startedAt = Date.now();

    try {
      const response = await this.httpService.axiosRef.request({
        url: targetUrl,
        method: req.method,
        headers,
        data,
        validateStatus: () => true,
        responseType: 'arraybuffer',
      });

      for (const [key, value] of Object.entries(response.headers)) {
        if (!this.shouldSkipResponseHeader(key) && value !== undefined) {
          res.setHeader(key, value as string | number | readonly string[]);
        }
      }

      this.logger.log(
        `${req.method} ${req.originalUrl} -> ${target} ${response.status} ${Date.now() - startedAt}ms`,
      );

      res.status(response.status).send(Buffer.from(response.data));
    } catch (error) {
      this.logger.error(
        `${req.method} ${req.originalUrl} -> ${target} failed after ${Date.now() - startedAt}ms`,
      );

      res.status(503).json({
        statusCode: 503,
        message: `Service phía sau chưa sẵn sàng: ${target}`,
        path: req.originalUrl,
      });
    }
  }

  private resolveTarget(path: string): string {
    const route = this.routes.find((item) =>
      item.prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`)),
    );

    if (!route) {
      throw new NotFoundException(`No gateway route configured for ${path}`);
    }

    return route.target;
  }

  private buildHeaders(req: Request) {
    const headers = { ...req.headers };
    delete headers.host;
    if (!String(req.headers['content-type'] || '').startsWith('multipart/form-data')) {
      delete headers['content-length'];
    }

    headers['x-forwarded-host'] = req.headers.host;
    headers['x-forwarded-proto'] = req.protocol;

    return headers;
  }

  private getRequestBody(req: Request & { rawBody?: Buffer }) {
    if (String(req.headers['content-type'] || '').startsWith('multipart/form-data')) {
      return req;
    }

    if (req.rawBody?.length) return req.rawBody;
    if (req.body && Object.keys(req.body).length > 0) return req.body;
    return undefined;
  }

  private shouldSkipResponseHeader(header: string): boolean {
    return ['transfer-encoding', 'connection', 'keep-alive'].includes(
      header.toLowerCase(),
    );
  }
}
