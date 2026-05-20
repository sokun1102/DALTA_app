/**
 * =====================================================
 * CATEGORY ENTITY - Định nghĩa cấu trúc bảng danh mục
 * =====================================================
 * Danh mục dùng để phân loại sản phẩm
 * VD: Điện thoại, Laptop, Phụ kiện...
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,   // Ngày tạo
  UpdateDateColumn,  // Ngày cập nhật
  OneToMany,         // Quan hệ 1-nhiều (1 danh mục có nhiều sản phẩm)
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('categories') // Tên bảng trong MySQL
export class Category {
  // ============ TRƯỜNG CƠ BẢN ============
  /** ID danh mục (tự động tăng) */
  @PrimaryGeneratedColumn()
  id: number;

  /** Tên danh mục (unique - không trùng lặp) */
  @Column({ unique: true })
  name: string;

  /** Mô tả danh mục (nullable - có thể không có) */
  @Column({ type: 'text', nullable: true })
  description: string;

  // ============ HIỂN THỊ ============
  /** URL hình ảnh đại diện cho danh mục (VD: banner category) */
  @Column({ nullable: true })
  imageUrl: string;

  /** Icon cho danh mục (có thể dùng icon font hoặc emoji) */
  @Column({ nullable: true })
  icon: string;

  /** Thứ tự hiển thị (danh mục có displayOrder nhỏ hơn hiển thị trước) */
  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  /** Danh mục có đang hoạt động không (có thể ẩn danh mục mà không xóa) */
  @Column({ default: true })
  isActive: boolean;

  // ============ LIÊN KẾT VỚI PRODUCTS ============
  /** Liên kết với Product - 1 danh mục có nhiều sản phẩm
   * Inverse side của quan hệ (bên Product có @ManyToOne)
   */
  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  // ============ TIMESTAMPS ============
  /** Ngày tạo danh mục */
  @CreateDateColumn()
  createdAt: Date;

  /** Ngày cập nhật danh mục */
  @UpdateDateColumn()
  updatedAt: Date;
}
