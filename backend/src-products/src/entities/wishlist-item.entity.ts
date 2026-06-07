import { CreateDateColumn, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('wishlist_items')
export class WishlistItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  productId: number;

  @CreateDateColumn()
  createdAt: Date;
}
