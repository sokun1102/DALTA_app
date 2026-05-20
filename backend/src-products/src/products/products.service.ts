/**
 * =====================================================
 * PRODUCTS SERVICE - Tầng xử lý nghiệp vụ sản phẩm
 * =====================================================
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not as TypeOrmNot } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
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
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private productImagesRepository: Repository<ProductImage>,
  ) {}

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

  async create(createProductDto: CreateProductDto): Promise<Product> {
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

    return this.findOne(savedProduct.id);
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    const { images, categoryId, ...updateData } = updateProductDto;

    Object.assign(product, {
      ...updateData,
      ...(categoryId !== undefined && { categoryId }),
    });

    await this.productsRepository.save(product);

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

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
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
}
