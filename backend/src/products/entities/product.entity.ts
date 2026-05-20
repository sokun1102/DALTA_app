/**
 * =====================================================
 * PRODUCT ENTITY - Định nghĩa cấu trúc bảng sản phẩm
 * =====================================================
 * Entity này ánh xạ tới bảng 'products' trong database
 * TypeORM sẽ tự động tạo bảng dựa trên các decorators
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,     // Tự động tạo ID tăng dần
  ManyToOne,                  // Quan hệ nhiều-1 (nhiều sản phẩm thuộc 1 danh mục)
  JoinColumn,                 // Cột khóa ngoại
  CreateDateColumn,           // Tự động lưu ngày tạo
  UpdateDateColumn,           // Tự động lưu ngày cập nhật
  OneToMany,                  // Quan hệ 1-nhiều (1 sản phẩm có nhiều ảnh)
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { ProductImage } from './product-image.entity';

@Entity('products') // Tên bảng trong MySQL
export class Product {
  // ============ TRƯỜNG CƠ BẢN ============
  /** ID sản phẩm (tự động tăng) */
  @PrimaryGeneratedColumn()
  id: number;

  /** Tên sản phẩm */
  @Column()
  name: string;

  // ============ GIÁ ============
  /** Giá bán (decimal: 10 chữ số, 2 số thập phân) */
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  /** Giá gốc (trước khi giảm giá) - nullable vì không phải sản phẩm nào cũng có giảm giá */
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice: number;

  // ============ THÔNG TIN CHI TIẾT ============
  /** Mô tả sản phẩm (text để lưu nhiều nội dung) */
  @Column({ type: 'text', nullable: true })
  description: string;

  /** Thương hiệu (VD: Apple, Samsung, Nike) */
  @Column({ nullable: true })
  brand: string;

  /** Mã sản phẩm (SKU - Stock Keeping Unit) */
  @Column({ nullable: true })
  sku: string;

  // ============ TỒN KHO ============
  /** Số lượng trong kho (mặc định: 0) */
  @Column({ type: 'int', default: 0 })
  stock: number;

  /** Sản phẩm có đang được hiển thị không (mặc định: true) */
  @Column({ default: true })
  isActive: boolean;

  // ============ ĐÁNH GIÁ & THỐNG KÊ ============
  /** Điểm đánh giá trung bình (0-5) */
  @Column({ default: 0 })
  rating: number;

  /** Tổng số lượt đánh giá */
  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  /** Số lượng đã bán */
  @Column({ type: 'int', default: 0 })
  soldCount: number;

  /** Số lượt xem sản phẩm */
  @Column({ type: 'int', default: 0 })
  viewCount: number;

  // ============ THÔNG SỐ KỸ THUẬT ============
  /** Thông số kỹ thuật (lưu dạng JSON)
   * VD: { "CPU": "Intel i7", "RAM": "16GB", "Ổ cứng": "512GB SSD" }
   */
  @Column({ type: 'json', nullable: true })
  specifications: Record<string, string>;

  /** Màu sắc sản phẩm */
  @Column({ nullable: true })
  color: string;

  /** Kích cỡ sản phẩm */
  @Column({ nullable: true })
  size: string;

  /** Trọng lượng sản phẩm */
  @Column({ nullable: true })
  weight: string;

  // ============ LIÊN KẾT VỚI BẢNG KHÁC ============
  /** Liên kết với Category - Nhiều sản phẩm thuộc 1 danh mục */
  @ManyToOne(() => Category, (category) => category.products, { nullable: true })
  @JoinColumn({ name: 'categoryId' }) // Tên cột khóa ngoại trong DB
  category: Category;

  /** ID của danh mục (cột khóa ngoại) */
  @Column({ nullable: true })
  categoryId: number;

  // ============ TAG ============
  /** Tags cho sản phẩm (lưu dạng mảng string)
   * VD: ['iphone', 'apple', 'smartphone', '5g']
   */
  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  // ============ TIMESTAMPS ============
  /** Ngày tạo sản phẩm (tự động) */
  @CreateDateColumn()
  createdAt: Date;

  /** Ngày cập nhật sản phẩm (tự động cập nhật mỗi khi sửa) */
  @UpdateDateColumn()
  updatedAt: Date;

  // ============ HÌNH ẢNH ============
  /** Liên kết với ProductImage - 1 sản phẩm có nhiều hình ảnh
   * cascade: true -> Khi xóa sản phẩm, các ảnh liên quan cũng bị xóa
   */
  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images: ProductImage[];
}
