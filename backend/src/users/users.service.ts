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
      where: { email },
      select: ['id', 'email', 'password', 'role'],
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) return null;

    Object.assign(user, userData);
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
    return this.addressRepository.find({ where: { userId } });
  }

  async addAddress(userId: number, data: Partial<Address>): Promise<Address> {
    const address = this.addressRepository.create({ ...data, userId });
    return this.addressRepository.save(address);
  }

  async updateAddress(userId: number, id: number, data: Partial<Address>): Promise<Address> {
    const address = await this.addressRepository.findOne({ where: { id, userId } });
    if (!address) throw new NotFoundException('Không tìm thấy địa chỉ');
    Object.assign(address, data);
    return this.addressRepository.save(address);
  }

  async deleteAddress(userId: number, id: number): Promise<void> {
    const address = await this.addressRepository.findOne({ where: { id, userId } });
    if (!address) throw new NotFoundException('Không tìm thấy địa chỉ');
    await this.addressRepository.remove(address);
  }

  async setDefaultAddress(userId: number, id: number): Promise<Address> {
    const address = await this.addressRepository.findOne({ where: { id, userId } });
    if (!address) throw new NotFoundException('Không tìm thấy địa chỉ');

    await this.addressRepository.update({ userId }, { isDefault: false });
    await this.addressRepository.update({ id, userId }, { isDefault: true });

    address.isDefault = true;
    return address;
  }
}
