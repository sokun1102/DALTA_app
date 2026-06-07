import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  productId: number;

  @Column({ default: 1 })
  quantity: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  selectedColor: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  selectedSize: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  productName: string | null;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  productPrice: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  productImage: string | null;
}
