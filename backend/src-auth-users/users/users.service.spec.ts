import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Address } from './address.entity';

describe('UsersService', () => {
  let service: UsersService;
  const usersRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn((data) => data),
    save: jest.fn((data) => Promise.resolve(data)),
  };
  const addressRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    create: jest.fn((data) => data),
    save: jest.fn((data) => Promise.resolve(data)),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: usersRepository },
        { provide: getRepositoryToken(Address), useValue: addressRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('normalizes email before lookup', async () => {
    usersRepository.findOne.mockResolvedValue(null);

    await service.findOneByEmail('  Sokun1102@Gmail.Com  ');

    expect(usersRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: 'sokun1102@gmail.com' } }),
    );
  });

  it('marks the first address as default', async () => {
    addressRepository.count.mockResolvedValue(0);

    await service.addAddress(12, {
      fullName: 'dang nhut truong',
      phone: '0900000000',
      street: '1 Nguyen Trai',
      city: 'Ho Chi Minh',
    } as any);

    expect(addressRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 12, isDefault: true }),
    );
  });
});
