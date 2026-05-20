/**
 * =====================================================
 * CATEGORIES SERVICE - Tầng xử lý nghiệp vụ danh mục
 * =====================================================
 * Chứa toàn bộ logic nghiệp vụ liên quan đến danh mục:
 * - CRUD cơ bản
 * - Lấy sản phẩm theo danh mục
 * - Lấy danh mục cho homepage
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Product } from '../products/entities/product.entity';

/**
 * Interface cho kết quả phân trang
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class CategoriesService {
  constructor(
    // Inject Category repository
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    
    // Inject Product repository để lấy sản phẩm theo danh mục
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  // ============================================================
  // PHƯƠNG THỨC CƠ BẢN (CRUD)
  // ============================================================

  /**
   * Lấy tất cả danh mục đang hoạt động
   * Sắp xếp theo displayOrder và name
   */
  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Lấy chi tiết một danh mục theo ID
   */
  async findOne(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Danh mục #${id} không tồn tại`);
    }
    return category;
  }

  /**
   * Tìm danh mục theo slug (hoặc name hoặc id)
   * Ví dụ: /categories/slug/iphone -> tìm category có name = "Iphone"
   */
  async findBySlug(slug: string): Promise<Category> {
    // Chuyển slug về dạng name (ví dụ: iphone -> Iphone)
    const name = slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();
    
    const category = await this.categoriesRepository.findOne({
      where: [
        { name },  // Tìm theo name
        { id: parseInt(slug) || 0 }, // Hoặc theo id nếu slug là số
      ],
    });
    
    if (!category) {
      throw new NotFoundException(`Danh mục "${slug}" không tồn tại`);
    }
    return category;
  }

  /**
   * Tạo danh mục mới
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const newCategory = this.categoriesRepository.create(createCategoryDto);
    return this.categoriesRepository.save(newCategory);
  }

  /**
   * Cập nhật danh mục
   */
  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);
    Object.assign(category, updateCategoryDto);
    return this.categoriesRepository.save(category);
  }

  /**
   * Xóa danh mục
   */
  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.categoriesRepository.remove(category);
  }

  // ============================================================
  // CÁC CHỨC NĂNG MỚI CHO EPIC 2
  // ============================================================

  /**
   * USER STORY 1: Lấy danh mục cho trang chủ với sản phẩm nổi bật
   * 
   * Mỗi danh mục sẽ kèm theo 4 sản phẩm bán chạy nhất
   * Dùng cho homepage - hiển thị "Danh mục + Sản phẩm nổi bật"
   */
  async getFeaturedCategories(limit: number = 6): Promise<Category[]> {
    // Lấy danh sách danh mục
    const categories = await this.categoriesRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
      take: limit,
    });

    // Lấy sản phẩm nổi bật cho từng danh mục
    for (const category of categories) {
      const products = await this.productsRepository.find({
        where: { categoryId: category.id, isActive: true },
        relations: ['images'],
        order: { soldCount: 'DESC' },
        take: 4,
      });
      category.products = products;
    }

    return categories;
  }

  /**
   * Lấy danh mục kèm sản phẩm nổi bật (chi tiết)
   */
  async findOneWithProducts(
    id: number,
    limit: number = 4,
  ): Promise<Category & { featuredProducts: Product[] }> {
    const category = await this.findOne(id);

    // Lấy sản phẩm theo danh mục, sắp xếp theo số lượng bán
    const featuredProducts = await this.productsRepository.find({
      where: { categoryId: id, isActive: true },
      relations: ['images'],
      order: { soldCount: 'DESC' },
      take: limit,
    });

    return {
      ...category,
      featuredProducts,
    };
  }

  /**
   * Lấy sản phẩm theo danh mục (phân trang)
   */
  async getProductsByCategory(
    categoryId: number,
    page: number = 1,
    limit: number = 12,
  ): Promise<PaginatedResult<Product>> {
    // Kiểm tra danh mục tồn tại
    await this.findOne(categoryId);

    const [data, total] = await this.productsRepository.findAndCount({
      where: { categoryId, isActive: true },
      relations: ['images'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
