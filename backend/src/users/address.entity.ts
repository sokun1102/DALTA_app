import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  fullName: string;

  @Column()
  phone: string;

  @Column()
  street: string;

  @Column()
  city: string;

  @Column({ nullable: true })
  district: string;

  @Column({ default: false })
  isDefault: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
