import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderId: number;

  @Column()
  productId: number;

  @Column()
  productName: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  productImage: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  selectedColor: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  selectedSize: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  lineTotal: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

}
