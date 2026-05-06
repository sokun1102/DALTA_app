import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    // Chúng ta cần dùng addSelect hoặc khai báo select vì password đã bị ẩn mặc định
    return this.usersRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'password', 'role'] // Ép buộc lấy cả password ra để kiểm tra
    });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }
}
