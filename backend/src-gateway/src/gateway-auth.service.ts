import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';

type ProtectedRoute = {
  prefixes: string[];
  methods?: string[];
  except?: string[];
};

@Injectable()
export class GatewayAuthService {
  private readonly protectedRoutes: ProtectedRoute[] = [
    { prefixes: ['/cart'] },
    { prefixes: ['/orders'], except: ['/orders/guest-checkout', '/orders/internal'] },
    {
      prefixes: ['/users/profile', '/users/addresses'],
    },
    { prefixes: ['/wishlist'] },
    {
      prefixes: ['/products'],
      methods: ['POST'],
    },
  ];

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  verifyRequest(req: Request, res: Response): boolean {
    if (!this.isProtected(req)) return true;

    const token = this.extractBearerToken(req);
    if (!token) {
      res.status(401).json({ message: 'Missing bearer token' });
      return false;
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      req.headers['x-user-id'] = String(payload.sub);
      req.headers['x-user-role'] = payload.role || '';
      return true;
    } catch {
      res.status(401).json({ message: 'Invalid or expired token' });
      return false;
    }
  }

  private isProtected(req: Request): boolean {
    return this.protectedRoutes.some((route) => {
      if (route.methods && !route.methods.includes(req.method)) return false;
      if (
        route.except?.some(
          (path) => req.path === path || req.path.startsWith(`${path}/`),
        )
      ) {
        return false;
      }

      return route.prefixes.some(
        (prefix) => req.path === prefix || req.path.startsWith(`${prefix}/`),
      );
    });
  }

  private extractBearerToken(req: Request): string | null {
    const authorization = req.headers.authorization;
    if (!authorization) return null;

    const [type, token] = authorization.split(' ');
    return type?.toLowerCase() === 'bearer' && token ? token : null;
  }
}
