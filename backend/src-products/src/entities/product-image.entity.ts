/**
 * =====================================================
 * PRODUCT IMAGE ENTITY - Định nghĩa cấu trúc bảng hình ảnh sản phẩm
 * =====================================================
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column({ default: false })
  isPrimary: boolean;

  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  @Column({ nullable: true })
  altText: string;

  @ManyToOne(() => Product, (product) => product.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: number;

  @CreateDateColumn()
  createdAt: Date;
}
