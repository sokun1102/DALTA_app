import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

export type BankTransferPaymentInstruction = {
  type: 'bank_transfer';
  bankName: string;
  bankFullName: string;
  bankBin: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  content: string;
  qrUrl: string;
};

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  orderNumber: string;

  @Column({ type: 'int', nullable: true })
  userId: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  guestEmail: string | null;

  @Column({ default: 'PENDING' })
  status: string;

  @Column({ type: 'text', nullable: true })
  cancelReason: string | null;

  @Column({ default: false })
  hiddenFromCustomer: boolean;

  @Column({ type: 'datetime', nullable: true })
  customerDeletedAt: Date | null;

  @Column()
  paymentMethod: string;

  @Column({ default: 'PENDING' })
  paymentStatus: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripeSessionId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripePaymentIntentId: string | null;

  @Column()
  shippingMethod: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  shippingFee: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  voucherCode: string | null;

  @Column({ type: 'json' })
  shippingAddress: Record<string, string>;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  paymentInstruction?: BankTransferPaymentInstruction;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
