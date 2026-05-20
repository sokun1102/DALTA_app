import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ default: 'user' })
  role: string; // 'admin' hoặc 'user'

  @Column({ nullable: true, select: false })
  resetToken: string;

  @Column({ nullable: true })
  resetTokenExpiry: Date;
}
