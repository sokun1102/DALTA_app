/**
 * =====================================================
 * PRODUCTS SERVICE - Tầng xử lý nghiệp vụ sản phẩm
 * =====================================================
 * Chứa toàn bộ logic nghiệp vụ liên quan đến sản phẩm:
 * - CRUD cơ bản (Create, Read, Update, Delete)
 * - Tìm kiếm và lọc sản phẩm
 * - Sắp xếp và phân trang
 * - Gợi ý sản phẩm liên quan
 * - Thống kê (brand, color, size có sẵn)
 * 
 * QUY TẮC: Service không biết request đến từ đâu (API hay cron job)
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not as TypeOrmNot } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto, SortBy, SortOrder } from './dto/product-query.dto';

/**
 * Interface cho kết quả phân trang
 * @property data - Mảng dữ liệu trang hiện tại
 * @property total - Tổng số bản ghi
 * @property page - Trang hiện tại
 * @property limit - Số bản ghi mỗi trang
 * @property totalPages - Tổng số trang
 */
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
    // Inject Product repository để thao tác với bảng products
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    
    // Inject ProductImage repository để thao tác với bảng product_images
    @InjectRepository(ProductImage)
    private productImagesRepository: Repository<ProductImage>,
  ) {}

  // ============================================================
  // PHƯƠNG THỨC CƠ BẢN (CRUD)
  // ============================================================

  /**
   * Lấy danh sách sản phẩm với filter, sort, pagination
   * 
   * @param query - Các tham số filter/sort/page từ client
   * @returns PaginatedResult - Danh sách sản phẩm + thông tin phân trang
   * 
   * Ví dụ query đầy đủ:
   * GET /products?search=iphone&categoryId=1&minPrice=5000&maxPrice=20000&sortBy=price&sortOrder=ASC&page=1&limit=12
   */
  async findAll(query: ProductQueryDto): Promise<PaginatedResult<Product>> {
    const {
      search,           // Từ khóa tìm kiếm
      categoryId,       // Lọc theo danh mục
      brand,            // Lọc theo thương hiệu
      color,            // Lọc theo màu
      size,             // Lọc theo size
      minPrice,         // Giá tối thiểu
      maxPrice,         // Giá tối đa
      page = 1,         // Trang (mặc định 1)
      limit = 12,       // Items mỗi trang (mặc định 12)
      sortBy = SortBy.CREATED_AT,  // Sắp xếp theo (mặc định: ngày tạo)
      sortOrder = SortOrder.DESC, // Thứ tự (mặc định: giảm dần)
      inStock,          // Chỉ sản phẩm còn hàng
      isActive = true,  // Chỉ sản phẩm đang hoạt động
    } = query;

    // Tạo query builder để xây dựng câu truy vấn động
    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')  // Alias 'product' để reference trong query
      .leftJoinAndSelect('product.category', 'category')    // Join bảng category
      .leftJoinAndSelect('product.images', 'images');       // Join bảng images

    // ============ SEARCH ============
    // Tìm kiếm theo tên, thương hiệu, mã SP, mô tả
    if (search) {
      queryBuilder.andWhere(
        '(product.name LIKE :search OR product.brand LIKE :search OR product.sku LIKE :search OR product.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // ============ FILTERS ============
    // Lọc theo danh mục
    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    // Lọc theo thương hiệu (LIKE để tìm gần đúng)
    if (brand) {
      queryBuilder.andWhere('product.brand LIKE :brand', { brand: `%${brand}%` });
    }

    // Lọc theo màu
    if (color) {
      queryBuilder.andWhere('product.color LIKE :color', { color: `%${color}%` });
    }

    // Lọc theo kích cỡ
    if (size) {
      queryBuilder.andWhere('product.size LIKE :size', { size: `%${size}%` });
    }

    // Lọc theo khoảng giá
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

    // Lọc sản phẩm còn hàng
    if (inStock) {
      queryBuilder.andWhere('product.stock > 0');
    }

    // Lọc theo trạng thái hoạt động
    if (isActive !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', { isActive });
    }

    // ============ SORTING ============
    // Áp dụng sắp xếp
    const sortColumn = this.getSortColumn(sortBy);
    queryBuilder.orderBy(`product.${sortColumn}`, sortOrder);

    // ============ PAGINATION ============
    // skip: bỏ qua bao nhiêu bản ghi
    // take: lấy bao nhiêu bản ghi
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query và lấy tổng count
    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Chuyển đổi enum SortBy sang tên cột trong database
   * 
   * @param sortBy - Enum SortBy
   * @returns Tên cột trong database
   */
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

  /**
   * Lấy chi tiết một sản phẩm theo ID
   * 
   * @param id - ID sản phẩm
   * @returns Product - Thông tin sản phẩm kèm category và images
   * @throws NotFoundException nếu không tìm thấy
   */
  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['category', 'images'], // Load luôn category và images
    });

    if (!product) {
      throw new NotFoundException(`Sản phẩm #${id} không tồn tại`);
    }

    return product;
  }

  /**
   * Lấy chi tiết sản phẩm và tự động tăng lượt xem
   * Dùng cho trang chi tiết sản phẩm
   * 
   * @param id - ID sản phẩm
   * @returns Product - Thông tin sản phẩm đã tăng viewCount
   */
  async findOneWithIncrementView(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['category', 'images'],
    });

    if (!product) {
      throw new NotFoundException(`Sản phẩm #${id} không tồn tại`);
    }

    // Tăng lượt xem lên 1
    product.viewCount += 1;
    await this.productsRepository.save(product);

    return product;
  }

  /**
   * Tạo sản phẩm mới
   * 
   * @param createProductDto - Dữ liệu tạo sản phẩm
   * @returns Product - Sản phẩm đã tạo kèm relations
   */
  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Tách images và categoryId ra vì xử lý riêng
    const { images, categoryId, ...productData } = createProductDto;

    // Tạo product entity từ DTO
    const product = this.productsRepository.create({
      ...productData,
      categoryId,
    });

    // Lưu vào database
    const savedProduct = await this.productsRepository.save(product);

    // Lưu hình ảnh nếu có
    if (images && images.length > 0) {
      const productImages = images.map((img, index) =>
        this.productImagesRepository.create({
          ...img,
          productId: savedProduct.id,
          // Ảnh đầu tiên mặc định là ảnh chính
          isPrimary: img.isPrimary ?? index === 0,
          displayOrder: img.displayOrder ?? index,
        }),
      );
      await this.productImagesRepository.save(productImages);
    }

    // Return với relations đã load
    return this.findOne(savedProduct.id);
  }

  /**
   * Cập nhật sản phẩm
   * 
   * @param id - ID sản phẩm cần cập nhật
   * @param updateProductDto - Dữ liệu cập nhật
   * @returns Product - Sản phẩm sau khi cập nhật
   */
  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    const { images, categoryId, ...updateData } = updateProductDto;

    // Merge dữ liệu mới vào product hiện tại
    Object.assign(product, {
      ...updateData,
      // Chỉ update categoryId nếu được gửi lên
      ...(categoryId !== undefined && { categoryId }),
    });

    await this.productsRepository.save(product);

    // Cập nhật hình ảnh nếu có
    if (images) {
      // Xóa hình ảnh cũ
      await this.productImagesRepository.delete({ productId: id });

      // Thêm hình ảnh mới
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

  /**
   * Xóa sản phẩm
   * 
   * @param id - ID sản phẩm cần xóa
   * Do có cascade: true nên images liên quan cũng bị xóa
   */
  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }

  // ============================================================
  // CÁC CHỨC NĂNG MỚI CHO EPIC 2 - DUYỆT & TÌM KIẾM
  // ============================================================

  /**
   * USER STORY 1: Lấy sản phẩm theo danh mục (phân trang)
   */
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

  /**
   * USER STORY 2: Tìm kiếm sản phẩm theo từ khóa
   * Tìm trong: name, brand, sku
   */
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

  /**
   * USER STORY 5: Lấy sản phẩm bán chạy nhất
   * Dùng cho homepage - section "Sản phẩm bán chạy"
   */
  async getBestSellers(limit: number = 10): Promise<Product[]> {
    return this.productsRepository.find({
      where: { isActive: true },
      relations: ['category', 'images'],
      order: { soldCount: 'DESC' }, // Sắp xếp theo số lượng bán giảm dần
      take: limit,
    });
  }

  /**
   * Lấy sản phẩm mới nhất
   * Dùng cho homepage - section "Sản phẩm mới"
   */
  async getNewest(limit: number = 10): Promise<Product[]> {
    return this.productsRepository.find({
      where: { isActive: true },
      relations: ['category', 'images'],
      order: { createdAt: 'DESC' }, // Sắp xếp theo ngày tạo mới nhất
      take: limit,
    });
  }

  /**
   * USER STORY 5: Lấy sản phẩm nổi bật (có rating cao)
   * Dùng cho homepage - section "Sản phẩm nổi bật"
   */
  async getFeatured(limit: number = 10): Promise<Product[]> {
    return this.productsRepository.find({
      where: { isActive: true },
      relations: ['category', 'images'],
      order: { rating: 'DESC' }, // Sắp xếp theo rating cao nhất
      take: limit,
    });
  }

  /**
   * USER STORY 5: Lấy sản phẩm gợi ý (liên quan)
   * Thuật toán:
   * 1. Tìm sản phẩm cùng danh mục trước
   * 2. Nếu không đủ, thêm sản phẩm cùng thương hiệu
   */
  async getRelatedProducts(productId: number, limit: number = 8): Promise<Product[]> {
    // Lấy thông tin sản phẩm hiện tại
    const product = await this.findOne(productId);

    // Tìm sản phẩm cùng danh mục (ưu tiên)
    const relatedByCategory = await this.productsRepository.find({
      where: {
        categoryId: product.categoryId,
        isActive: true,
        id: TypeOrmNot(product.id), // Loại trừ sản phẩm hiện tại
      },
      relations: ['category', 'images'],
      take: limit,
      order: { rating: 'DESC' },
    });

    // Nếu không đủ, thêm sản phẩm cùng thương hiệu
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

      // Merge và loại bỏ trùng lặp
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

  /**
   * USER STORY 5: Lấy sản phẩm thường được mua cùng nhau
   * Trong thực tế sẽ dựa trên dữ liệu đơn hàng
   * Hiện tại placeholder: sản phẩm cùng danh mục, bán chạy
   */
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

  // ============================================================
  // THỐNG KÊ & FILTER OPTIONS
  // ============================================================

  /**
   * Lấy danh sách thương hiệu có sẵn (dùng cho filter)
   * Trả về array các tên thương hiệu không trùng lặp
   */
  async getBrands(): Promise<string[]> {
    const result = await this.productsRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.brand', 'brand')
      .where('product.brand IS NOT NULL')
      .andWhere('product.brand != ""')
      .getRawMany();

    return result.map((r) => r.brand).filter(Boolean);
  }

  /**
   * Lấy danh sách màu sắc có sẵn (dùng cho filter)
   */
  async getAvailableColors(): Promise<string[]> {
    const result = await this.productsRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.color', 'color')
      .where('product.color IS NOT NULL')
      .andWhere('product.color != ""')
      .getRawMany();

    return result.map((r) => r.color).filter(Boolean);
  }

  /**
   * Lấy danh sách kích cỡ có sẵn (dùng cho filter)
   */
  async getAvailableSizes(): Promise<string[]> {
    const result = await this.productsRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.size', 'size')
      .where('product.size IS NOT NULL')
      .andWhere('product.size != ""')
      .getRawMany();

    return result.map((r) => r.size).filter(Boolean);
  }

  /**
   * Lấy khoảng giá (min/max) của tất cả sản phẩm
   * Dùng để hiển thị slider giá trong filter
   */
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
