/**
 * =====================================================
 * PRODUCT ENTITY - Định nghĩa cấu trúc bảng sản phẩm
 * =====================================================
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Category } from './category.entity';
import { ProductImage } from './product-image.entity';
import { Brand } from './brand.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 14, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  originalPrice: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  sku: string;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  @Column({ type: 'int', default: 0 })
  soldCount: number;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'json', nullable: true })
  specifications: Record<string, string>;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  size: string;

  @Column({ nullable: true })
  weight: string;

  @ManyToOne(() => Category, (category) => category.products, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ nullable: true })
  categoryId: number;

  @ManyToOne(() => Brand, (brand) => brand.products, { nullable: true })
  @JoinColumn({ name: 'brandId' })
  brandEntity: Brand;

  @Column({ nullable: true })
  brandId: number;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images: ProductImage[];
}
