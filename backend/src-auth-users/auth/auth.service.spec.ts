import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  const usersService = {
    findOneByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findByResetToken: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: { sign: jest.fn(() => 'signed-token') } },
        { provide: HttpService, useValue: { axiosRef: { post: jest.fn() } } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('validates a user with correct password', async () => {
    const password = await bcrypt.hash('admin1234', 4);
    usersService.findOneByEmail.mockResolvedValue({
      id: 1,
      email: 'sokun1102@gmail.com',
      password,
      role: 'user',
    });

    const result = await service.validateUser('sokun1102@gmail.com', 'admin1234');

    expect(result).toMatchObject({ id: 1, email: 'sokun1102@gmail.com', role: 'user' });
    expect(result.password).toBeUndefined();
  });
});
