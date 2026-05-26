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
  role: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true, type: 'date' })
  birthDate: Date;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true, select: false })
  resetToken: string;

  @Column({ nullable: true })
  resetTokenExpiry: Date;
}
