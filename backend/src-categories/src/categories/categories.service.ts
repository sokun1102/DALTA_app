/**
 * =====================================================
 * CATEGORIES SERVICE - Tầng xử lý nghiệp vụ danh mục
 * =====================================================
 * KHÔNG query trực tiếp Product
 * Gọi Products Service (HTTP) để lấy sản phẩm
 */

import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoryWithProducts extends Category {
  featuredProducts: any[];
}

@Injectable()
export class CategoriesService {
  private readonly PRODUCTS_SERVICE_URL = process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3001';

  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private async logAuditAction(
    action: string,
    details: string,
    user?: { userId: number; email: string } | null,
    ip: string = 'internal',
  ): Promise<void> {
    try {
      const ordersServiceUrl = this.configService.get<string>('ORDERS_SERVICE_URL') || 'http://localhost:3003';
      const internalServiceKey = this.configService.get<string>('INTERNAL_SERVICE_KEY') || 'local-dev-internal-key';
      await this.httpService.axiosRef.post(
        `${ordersServiceUrl}/settings/audit-logs/internal`,
        { user, action, details, ip, type: 'ADMIN' },
        { headers: { 'x-internal-service-key': internalServiceKey } },
      );
    } catch (err) {
      console.warn('Failed to log category audit action:', err.message);
    }
  }

  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Danh mục #${id} không tồn tại`);
    }
    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const name = slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();

    const category = await this.categoriesRepository.findOne({
      where: [
        { name },
        { id: parseInt(slug) || 0 },
      ],
    });

    if (!category) {
      throw new NotFoundException(`Danh mục "${slug}" không tồn tại`);
    }
    return category;
  }

  async create(
    createCategoryDto: CreateCategoryDto,
    adminUser?: { userId: number; email: string } | null,
    clientIp: string = 'internal',
  ): Promise<Category> {
    const newCategory = this.categoriesRepository.create(createCategoryDto);
    const saved = await this.categoriesRepository.save(newCategory);

    // Log audit action
    const details = `Đã tạo danh mục mới: ${saved.name} (Slug: ${saved.slug || 'N/A'}).`;
    await this.logAuditAction('Thêm danh mục', details, adminUser, clientIp);

    return saved;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    adminUser?: { userId: number; email: string } | null,
    clientIp: string = 'internal',
  ): Promise<Category> {
    const category = await this.findOne(id);
    Object.assign(category, updateCategoryDto);
    const saved = await this.categoriesRepository.save(category);

    // Log audit action
    const details = `Đã cập nhật danh mục #${id} (${saved.name}).`;
    await this.logAuditAction('Cập nhật danh mục', details, adminUser, clientIp);

    return saved;
  }

  async remove(
    id: number,
    adminUser?: { userId: number; email: string } | null,
    clientIp: string = 'internal',
  ): Promise<void> {
    const category = await this.findOne(id);
    await this.categoriesRepository.remove(category);

    // Log audit action
    const details = `Đã xóa danh mục #${id} (${category.name}).`;
    await this.logAuditAction('Xóa danh mục', details, adminUser, clientIp);
  }

  /**
   * Lấy danh mục cho trang chủ với sản phẩm nổi bật
   * GỌI Products Service (HTTP) thay vì query trực tiếp
   */
  async getFeaturedCategories(limit: number = 6): Promise<CategoryWithProducts[]> {
    const categories = await this.categoriesRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
      take: limit,
    });

    const categoriesWithProducts: CategoryWithProducts[] = await Promise.all(
      categories.map(async (category) => {
        try {
          const response = await this.httpService.axiosRef.get(
            `${this.PRODUCTS_SERVICE_URL}/products/category/${category.id}?limit=4`,
          );
          return {
            ...category,
            featuredProducts: response.data.data || [],
          };
        } catch (error) {
          return {
            ...category,
            featuredProducts: [],
          };
        }
      }),
    );

    return categoriesWithProducts;
  }

  /**
   * Lấy danh mục kèm sản phẩm nổi bật (chi tiết)
   */
  async findOneWithProducts(
    id: number,
    limit: number = 4,
  ): Promise<CategoryWithProducts> {
    const category = await this.findOne(id);

    try {
      const response = await this.httpService.axiosRef.get(
        `${this.PRODUCTS_SERVICE_URL}/products/category/${id}?limit=${limit}`,
      );
      return {
        ...category,
        featuredProducts: response.data.data || [],
      };
    } catch (error) {
      return {
        ...category,
        featuredProducts: [],
      };
    }
  }

  /**
   * Lấy sản phẩm theo danh mục (phân trang)
   * GỌI Products Service (HTTP)
   */
  async getProductsByCategory(
    categoryId: number,
    page: number = 1,
    limit: number = 12,
  ): Promise<PaginatedResult<any>> {
    await this.findOne(categoryId);

    try {
      const response = await this.httpService.axiosRef.get(
        `${this.PRODUCTS_SERVICE_URL}/products/category/${categoryId}?page=${page}&limit=${limit}`,
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Không thể lấy sản phẩm từ Products Service',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
