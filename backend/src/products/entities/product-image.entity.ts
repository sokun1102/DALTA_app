/**
 * =====================================================
 * PRODUCT IMAGE ENTITY - Định nghĩa cấu trúc bảng hình ảnh sản phẩm
 * =====================================================
 * Mỗi sản phẩm có thể có nhiều hình ảnh
 * Entity này lưu thông tin chi tiết từng ảnh
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,      // Quan hệ nhiều-1 (nhiều ảnh thuộc 1 sản phẩm)
  JoinColumn,     // Cột khóa ngoại
  CreateDateColumn, // Ngày tạo
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_images') // Tên bảng trong MySQL
export class ProductImage {
  // ============ TRƯỜNG CƠ BẢN ============
  /** ID hình ảnh (tự động tăng) */
  @PrimaryGeneratedColumn()
  id: number;

  /** URL của hình ảnh (bắt buộc) */
  @Column()
  url: string;

  // ============ THUỘC TÍNH ẢNH ============
  /** Có phải là ảnh chính không (ảnh đại diện sản phẩm)
   * VD: Ảnh đầu tiên khi upload thường là ảnh chính
   */
  @Column({ default: false })
  isPrimary: boolean;

  /** Thứ tự hiển thị ảnh (ảnh có displayOrder nhỏ hơn sẽ hiển thị trước) */
  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  /** Alt text - văn bản thay thế khi ảnh không load được
   * Cũng dùng cho SEO và accessibility
   */
  @Column({ nullable: true })
  altText: string;

  // ============ LIÊN KẾT VỚI PRODUCT ============
  /** Liên kết với Product - Nhiều ảnh thuộc 1 sản phẩm
   * onDelete: 'CASCADE' -> Khi xóa sản phẩm, các ảnh cũng bị xóa tự động
   */
  @ManyToOne(() => Product, (product) => product.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' }) // Tên cột khóa ngoại
  product: Product;

  /** ID của sản phẩm (cột khóa ngoại) */
  @Column()
  productId: number;

  // ============ TIMESTAMP ============
  /** Ngày thêm ảnh */
  @CreateDateColumn()
  createdAt: Date;
}
