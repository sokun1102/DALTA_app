import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL') || '';
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD') || '';

    if (!adminEmail || !adminPassword) {
      console.warn('--- THIẾU CẤU HÌNH ADMIN TRONG FILE .ENV ---');
      return;
    }

    const adminExist = await this.usersService.findOneByEmail(adminEmail);

    if (!adminExist) {
      console.log('--- KHỞI TẠO TÀI KHOẢN ADMIN MẶC ĐỊNH ---');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await this.usersService.create({
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      } as any);
      console.log(`Admin created: ${adminEmail}`);
    }
  }

  getHello(): string {
    return 'Dalta API is running!';
  }
}
