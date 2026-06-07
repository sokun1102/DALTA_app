import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Address } from './address.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email.trim().toLowerCase() },
      select: ['id', 'email', 'password', 'role', 'fullName'],
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ order: { id: 'DESC' } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create({
      ...this.stripUndefined(userData),
      email: userData.email?.trim().toLowerCase(),
    });
    return this.usersRepository.save(user);
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) return null;

    Object.assign(user, this.stripUndefined(userData));
    return this.usersRepository.save(user);
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.resetToken')
      .addSelect('user.resetTokenExpiry')
      .where('user.resetToken = :token', { token })
      .getOne();
  }

  async getAddresses(userId: number): Promise<Address[]> {
    return this.addressRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', id: 'DESC' },
    });
  }

  async getAddress(userId: number, id: number): Promise<Address> {
    const address = await this.addressRepository.findOne({ where: { id, userId } });
    if (!address) throw new NotFoundException('Không tìm thấy địa chỉ');
    return address;
  }

  async addAddress(userId: number, data: Partial<Address>): Promise<Address> {
    const count = await this.addressRepository.count({ where: { userId } });
    const shouldBeDefault = count === 0 || data.isDefault === true;

    if (shouldBeDefault) {
      await this.addressRepository.update({ userId }, { isDefault: false });
    }

    const address = this.addressRepository.create({
      ...this.stripUndefined(data),
      userId,
      isDefault: shouldBeDefault,
    });
    return this.addressRepository.save(address);
  }

  async updateAddress(userId: number, id: number, data: Partial<Address>): Promise<Address> {
    const address = await this.addressRepository.findOne({ where: { id, userId } });
    if (!address) throw new NotFoundException('Không tìm thấy địa chỉ');

    if (data.isDefault === true) {
      await this.addressRepository.update({ userId }, { isDefault: false });
    }

    Object.assign(address, this.stripUndefined(data));
    return this.addressRepository.save(address);
  }

  async deleteAddress(userId: number, id: number): Promise<void> {
    const address = await this.addressRepository.findOne({ where: { id, userId } });
    if (!address) throw new NotFoundException('Không tìm thấy địa chỉ');
    await this.addressRepository.remove(address);

    if (address.isDefault) {
      const nextAddress = await this.addressRepository.findOne({
        where: { userId },
        order: { id: 'DESC' },
      });

      if (nextAddress) {
        nextAddress.isDefault = true;
        await this.addressRepository.save(nextAddress);
      }
    }
  }

  async setDefaultAddress(userId: number, id: number): Promise<Address> {
    const address = await this.addressRepository.findOne({ where: { id, userId } });
    if (!address) throw new NotFoundException('Không tìm thấy địa chỉ');

    await this.addressRepository.update({ userId }, { isDefault: false });
    await this.addressRepository.update({ id, userId }, { isDefault: true });

    address.isDefault = true;
    return address;
  }

  private stripUndefined<T extends Record<string, any>>(data: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    ) as Partial<T>;
  }
}
