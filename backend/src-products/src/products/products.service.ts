/**
 * =====================================================
 * PRODUCTS SERVICE - Tầng xử lý nghiệp vụ sản phẩm
 * =====================================================
 */

import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not as TypeOrmNot } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductImage } from '../entities/product-image.entity';
import { ProductReview } from '../entities/product-review.entity';
import { WishlistItem } from '../entities/wishlist-item.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto, SortBy, SortOrder } from './dto/product-query.dto';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ProductsService {
  private readonly ordersServiceUrl: string;
  private readonly internalServiceKey: string;

  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private productImagesRepository: Repository<ProductImage>,
    @InjectRepository(ProductReview)
    private reviewsRepository: Repository<ProductReview>,
    @InjectRepository(WishlistItem)
    private wishlistRepository: Repository<WishlistItem>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.ordersServiceUrl =
      this.configService.get<string>('ORDERS_SERVICE_URL') || 'http://localhost:3003';
    this.internalServiceKey =
      this.configService.get<string>('INTERNAL_SERVICE_KEY') || 'local-dev-internal-key';
  }

  async findAll(query: ProductQueryDto): Promise<PaginatedResult<Product>> {
    const {
      search,
      categoryId,
      brand,
      color,
      size,
      minPrice,
      maxPrice,
      page = 1,
      limit = 12,
      sortBy = SortBy.CREATED_AT,
      sortOrder = SortOrder.DESC,
      inStock,
      isActive = true,
    } = query;

    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images');

    if (search) {
      queryBuilder.andWhere(
        '(product.name LIKE :search OR product.brand LIKE :search OR product.sku LIKE :search OR product.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (brand) {
      queryBuilder.andWhere('product.brand LIKE :brand', { brand: `%${brand}%` });
    }

    if (color) {
      queryBuilder.andWhere('product.color LIKE :color', { color: `%${color}%` });
    }

    if (size) {
      queryBuilder.andWhere('product.size LIKE :size', { size: `%${size}%` });
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      queryBuilder.andWhere('product.price BETWEEN :minPrice AND :maxPrice', {
        minPrice,
        maxPrice,
      });
    } else if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    } else if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (inStock) {
      queryBuilder.andWhere('product.stock > 0');
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', { isActive });
    }

    const sortColumn = this.getSortColumn(sortBy);
    queryBuilder.orderBy(`product.${sortColumn}`, sortOrder);

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private getSortColumn(sortBy: SortBy): string {
    const columnMap: Record<SortBy, string> = {
      [SortBy.PRICE]: 'price',
      [SortBy.CREATED_AT]: 'createdAt',
      [SortBy.RATING]: 'rating',
      [SortBy.SOLD_COUNT]: 'soldCount',
      [SortBy.VIEW_COUNT]: 'viewCount',
      [SortBy.NAME]: 'name',
    };
    return columnMap[sortBy] || 'createdAt';
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['category', 'images'],
    });

    if (!product) {
      throw new NotFoundException(`Sản phẩm #${id} không tồn tại`);
    }

    return product;
  }

  async findOneWithIncrementView(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['category', 'images'],
    });

    if (!product) {
      throw new NotFoundException(`Sản phẩm #${id} không tồn tại`);
    }

    product.viewCount += 1;
    await this.productsRepository.save(product);

    return product;
  }

  async create(
    createProductDto: CreateProductDto,
    adminUser?: { userId: number; email: string } | null,
    clientIp: string = 'internal',
  ): Promise<Product> {
    const { images, categoryId, ...productData } = createProductDto;

    const product = this.productsRepository.create({
      ...productData,
      categoryId,
    });

    const savedProduct = await this.productsRepository.save(product);

    if (images && images.length > 0) {
      const productImages = images.map((img, index) =>
        this.productImagesRepository.create({
          ...img,
          productId: savedProduct.id,
          isPrimary: img.isPrimary ?? index === 0,
          displayOrder: img.displayOrder ?? index,
        }),
      );
      await this.productImagesRepository.save(productImages);
    }

    // Log audit action
    const details = `Đã tạo sản phẩm mới: ${savedProduct.name} (SKU: ${savedProduct.sku || 'N/A'}, Giá: ${savedProduct.price}đ).`;
    await this.logAuditAction('Thêm sản phẩm', details, adminUser, clientIp);

    return this.findOne(savedProduct.id);
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    adminUser?: { userId: number; email: string } | null,
    clientIp: string = 'internal',
  ): Promise<Product> {
    const product = await this.findOne(id);
    const { images, categoryId, ...updateData } = updateProductDto;

    Object.assign(product, {
      ...updateData,
      ...(categoryId !== undefined && { categoryId }),
    });

    const saved = await this.productsRepository.save(product);

    if (images) {
      await this.productImagesRepository.delete({ productId: id });

      if (images.length > 0) {
        const productImages = images.map((img, index) =>
          this.productImagesRepository.create({
            ...img,
            productId: id,
            isPrimary: img.isPrimary ?? index === 0,
            displayOrder: img.displayOrder ?? index,
          }),
        );
        await this.productImagesRepository.save(productImages);
      }
    }

    // Log audit action
    const details = `Đã cập nhật thông tin sản phẩm #${id} (${saved.name}).`;
    await this.logAuditAction('Cập nhật sản phẩm', details, adminUser, clientIp);

    return this.findOne(id);
  }

  async remove(
    id: number,
    adminUser?: { userId: number; email: string } | null,
    clientIp: string = 'internal',
  ): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);

    // Log audit action
    const details = `Đã xóa sản phẩm #${id} (${product.name}).`;
    await this.logAuditAction('Xóa sản phẩm', details, adminUser, clientIp);
  }

  async findByCategory(
    categoryId: number,
    page: number = 1,
    limit: number = 12,
  ): Promise<PaginatedResult<Product>> {
    return this.findAll({
      categoryId,
      page,
      limit,
      sortBy: SortBy.CREATED_AT,
      sortOrder: SortOrder.DESC,
    });
  }

  async search(
    keyword: string,
    page: number = 1,
    limit: number = 12,
  ): Promise<PaginatedResult<Product>> {
    return this.findAll({
      search: keyword,
      page,
      limit,
    });
  }

  async getBestSellers(limit: number = 10): Promise<Product[]> {
    return this.productsRepository.find({
      where: { isActive: true },
      relations: ['category', 'images'],
      order: { soldCount: 'DESC' },
      take: limit,
    });
  }

  async getNewest(limit: number = 10): Promise<Product[]> {
    return this.productsRepository.find({
      where: { isActive: true },
      relations: ['category', 'images'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getFeatured(limit: number = 10): Promise<Product[]> {
    return this.productsRepository.find({
      where: { isActive: true },
      relations: ['category', 'images'],
      order: { rating: 'DESC' },
      take: limit,
    });
  }

  async getBestSellersByCategory(categoryId: number, limit: number = 4): Promise<Product[]> {
    return this.productsRepository.find({
      where: { categoryId, isActive: true },
      relations: ['images'],
      order: { soldCount: 'DESC' },
      take: limit,
    });
  }

  async getRelatedProducts(productId: number, limit: number = 8): Promise<Product[]> {
    const product = await this.findOne(productId);

    const relatedByCategory = await this.productsRepository.find({
      where: {
        categoryId: product.categoryId,
        isActive: true,
        id: TypeOrmNot(product.id),
      },
      relations: ['category', 'images'],
      take: limit,
      order: { rating: 'DESC' },
    });

    if (relatedByCategory.length < limit && product.brand) {
      const relatedByBrand = await this.productsRepository.find({
        where: {
          brand: product.brand,
          isActive: true,
          id: TypeOrmNot(product.id),
        },
        relations: ['category', 'images'],
        take: limit - relatedByCategory.length,
        order: { soldCount: 'DESC' },
      });

      const existingIds = new Set(relatedByCategory.map((p) => p.id));
      for (const p of relatedByBrand) {
        if (!existingIds.has(p.id)) {
          relatedByCategory.push(p);
          existingIds.add(p.id);
        }
      }
    }

    return relatedByCategory;
  }

  async getFrequentlyBoughtTogether(productId: number, limit: number = 4): Promise<Product[]> {
    const product = await this.findOne(productId);

    return this.productsRepository.find({
      where: {
        categoryId: product.categoryId,
        isActive: true,
        id: TypeOrmNot(product.id),
      },
      relations: ['category', 'images'],
      take: limit,
      order: { soldCount: 'DESC' },
    });
  }

  async getBrands(): Promise<string[]> {
    const result = await this.productsRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.brand', 'brand')
      .where('product.brand IS NOT NULL')
      .andWhere('product.brand != ""')
      .getRawMany();

    return result.map((r) => r.brand).filter(Boolean);
  }

  async getAvailableColors(): Promise<string[]> {
    const result = await this.productsRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.color', 'color')
      .where('product.color IS NOT NULL')
      .andWhere('product.color != ""')
      .getRawMany();

    return result.map((r) => r.color).filter(Boolean);
  }

  async getAvailableSizes(): Promise<string[]> {
    const result = await this.productsRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.size', 'size')
      .where('product.size IS NOT NULL')
      .andWhere('product.size != ""')
      .getRawMany();

    return result.map((r) => r.size).filter(Boolean);
  }

  async getPriceRanges(): Promise<{ min: number; max: number }> {
    const result = await this.productsRepository
      .createQueryBuilder('product')
      .select('MIN(product.price)', 'minPrice')
      .addSelect('MAX(product.price)', 'maxPrice')
      .getRawOne();

    return {
      min: result?.minPrice || 0,
      max: result?.maxPrice || 1000000,
    };
  }

  async findReviews(productId: number): Promise<ProductReview[]> {
    await this.findOne(productId);
    return this.reviewsRepository.find({
      where: { productId, isVisible: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findAllReviewsForAdmin(): Promise<ProductReview[]> {
    return this.reviewsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async createReview(
    productId: number,
    user: { userId: number; email?: string },
    dto: CreateReviewDto,
  ): Promise<ProductReview> {
    await this.findOne(productId);
    await this.ensureUserCanReviewProduct(user.userId, productId);

    const review = await this.reviewsRepository.save(
      this.reviewsRepository.create({
        productId,
        userId: user.userId,
        userEmail: user.email || null,
        rating: dto.rating,
        comment: dto.comment?.trim() || null,
      }),
    );

    await this.refreshProductRating(productId);
    return review;
  }

  async updateReviewVisibility(id: number, isVisible: boolean): Promise<ProductReview> {
    const review = await this.reviewsRepository.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');

    review.isVisible = isVisible;
    const savedReview = await this.reviewsRepository.save(review);
    await this.refreshProductRating(savedReview.productId);
    return savedReview;
  }

  async removeReview(id: number): Promise<{ deleted: true }> {
    const review = await this.reviewsRepository.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');

    await this.reviewsRepository.remove(review);
    await this.refreshProductRating(review.productId);
    return { deleted: true };
  }

  async addProductImage(productId: number, imageUrl: string): Promise<Product> {
    const product = await this.findOne(productId);
    await this.productImagesRepository.update({ productId }, { isPrimary: false });
    await this.productImagesRepository.save(
      this.productImagesRepository.create({
        productId,
        url: imageUrl,
        isPrimary: true,
        displayOrder: 0,
        altText: product.name,
      }),
    );
    return this.findOne(productId);
  }

  private async ensureUserCanReviewProduct(
    userId: number,
    productId: number,
  ): Promise<void> {
    try {
      const response = await this.httpService.axiosRef.get<{ eligible: boolean }>(
        `${this.ordersServiceUrl}/orders/internal/users/${userId}/products/${productId}/delivered`,
        {
          headers: { 'x-internal-service-key': this.internalServiceKey },
        },
      );

      if (!response.data?.eligible) {
        throw new BadRequestException(
          'Chỉ có thể đánh giá sản phẩm trong đơn hàng đã giao thành công.',
        );
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error?.response?.status === 400) {
        throw new BadRequestException(
          error.response.data?.message ||
            'Chỉ có thể đánh giá sản phẩm trong đơn hàng đã giao thành công.',
        );
      }

      throw new ServiceUnavailableException('Orders Service is unavailable');
    }
  }

  async findWishlist(userId: number) {
    const items = await this.wishlistRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    const productIds = items.map((item) => item.productId);
    if (productIds.length === 0) return [];

    return this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.id IN (:...productIds)', { productIds })
      .getMany();
  }

  async addToWishlist(userId: number, productId: number): Promise<WishlistItem> {
    await this.findOne(productId);

    const existing = await this.wishlistRepository.findOne({
      where: { userId, productId },
    });
    if (existing) return existing;

    return this.wishlistRepository.save(
      this.wishlistRepository.create({ userId, productId }),
    );
  }

  async removeFromWishlist(userId: number, productId: number): Promise<void> {
    await this.wishlistRepository.delete({ userId, productId });
  }

  private async refreshProductRating(productId: number): Promise<void> {
    const result = await this.reviewsRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avgRating')
      .addSelect('COUNT(review.id)', 'reviewCount')
      .where('review.productId = :productId', { productId })
      .andWhere('review.isVisible = :isVisible', { isVisible: true })
      .getRawOne();

    await this.productsRepository.update(productId, {
      rating: Number(Number(result?.avgRating || 0).toFixed(1)),
      reviewCount: Number(result?.reviewCount || 0),
    });
  }

  private async logAuditAction(
    action: string,
    details: string,
    user?: { userId: number; email: string } | null,
    ip: string = 'internal',
  ): Promise<void> {
    try {
      await this.httpService.axiosRef.post(
        `${this.ordersServiceUrl}/settings/audit-logs/internal`,
        { user, action, details, ip, type: 'ADMIN' },
        { headers: { 'x-internal-service-key': this.internalServiceKey } },
      );
    } catch (err) {
      console.warn('Failed to log product audit action:', err.message);
    }
  }
}
