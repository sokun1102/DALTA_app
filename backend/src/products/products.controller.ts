/**
 * =====================================================
 * PRODUCTS CONTROLLER - Tầng nhận request từ client
 * =====================================================
 * Controller tiếp nhận HTTP requests và gọi Service xử lý
 * 
 * QUY TẮC:
 * - Controller chỉ nhận request, validate cơ bản, gọi Service
 * - KHÔNG chứa logic nghiệp vụ
 * - Trả về response cho client
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,           // Convert string param sang number
  DefaultValuePipe,       // Giá trị mặc định cho query param
  ParseBoolPipe,          // Convert string sang boolean
} from '@nestjs/common';
import { ProductsService } from './products.service';

// Guards & Decorators cho authentication/authorization
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// DTOs
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@Controller('products') // Prefix cho tất cả routes: /products
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ============================================================
  // USER STORY 2: TÌM KIẾM SẢN PHẨM
  // USER STORY 3: LỌC VÀ SẮP XẾP
  // ============================================================

  /**
   * GET /products
   * 
   * Lấy danh sách sản phẩm với filter, sort, pagination
   * 
   * Query params:
   * - search: từ khóa tìm kiếm
   * - categoryId: lọc theo danh mục
   * - brand, color, size: lọc theo thuộc tính
   * - minPrice, maxPrice: lọc theo giá
   * - sortBy, sortOrder: sắp xếp
   * - page, limit: phân trang
   * - inStock: chỉ sản phẩm còn hàng
   * 
   * Ví dụ: GET /products?search=iphone&categoryId=1&minPrice=5000&sortBy=price&page=1&limit=12
   */
  @Get()
  async findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  // ============================================================
  // USER STORY 4: XEM CHI TIẾT SẢN PHẨM
  // ============================================================

  /**
   * GET /products/:id
   * 
   * Lấy chi tiết một sản phẩm theo ID
   * Tự động tăng lượt xem mỗi khi được gọi
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOneWithIncrementView(id);
  }

  // ============================================================
  // USER STORY 5: SẢN PHẨM GỢI Ý
  // ============================================================

  /**
   * GET /products/:id/related
   * 
   * Lấy sản phẩm liên quan (cùng danh mục, cùng thương hiệu)
   */
  @Get(':id/related')
  async getRelatedProducts(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit', new DefaultValuePipe(8), ParseIntPipe) limit: number,
  ) {
    return this.productsService.getRelatedProducts(id, limit);
  }

  /**
   * GET /products/:id/frequently-bought-together
   * 
   * Lấy sản phẩm thường được mua cùng nhau
   * (Placeholder - sẽ dựa trên dữ liệu đơn hàng thực tế)
   */
  @Get(':id/frequently-bought-together')
  async getFrequentlyBoughtTogether(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit', new DefaultValuePipe(4), ParseIntPipe) limit: number,
  ) {
    return this.productsService.getFrequentlyBoughtTogether(id, limit);
  }

  // ============================================================
  // ENDPOINTS CHO HOMEPAGE
  // ============================================================

  /**
   * GET /products/featured/home
   * 
   * Lấy sản phẩm nổi bật (rating cao)
   * Dùng cho section "Sản phẩm nổi bật" trên homepage
   */
  @Get('featured/home')
  async getFeaturedForHome(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.productsService.getFeatured(limit);
  }

  /**
   * GET /products/best-sellers/home
   * 
   * Lấy sản phẩm bán chạy nhất
   * Dùng cho section "Sản phẩm bán chạy" trên homepage
   */
  @Get('best-sellers/home')
  async getBestSellersForHome(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.productsService.getBestSellers(limit);
  }

  /**
   * GET /products/newest/home
   * 
   * Lấy sản phẩm mới nhất
   * Dùng cho section "Sản phẩm mới" trên homepage
   */
  @Get('newest/home')
  async getNewestForHome(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.productsService.getNewest(limit);
  }

  // ============================================================
  // FILTER OPTIONS - Trả về các tùy chọn filter cho frontend
  // ============================================================

  /**
   * GET /products/filters/brands
   * 
   * Lấy danh sách thương hiệu có sẵn
   * Dùng để hiển thị dropdown/breadcrumb filter thương hiệu
   */
  @Get('filters/brands')
  async getBrands() {
    return this.productsService.getBrands();
  }

  /**
   * GET /products/filters/colors
   * 
   * Lấy danh sách màu sắc có sẵn
   */
  @Get('filters/colors')
  async getColors() {
    return this.productsService.getAvailableColors();
  }

  /**
   * GET /products/filters/sizes
   * 
   * Lấy danh sách kích cỡ có sẵn
   */
  @Get('filters/sizes')
  async getSizes() {
    return this.productsService.getAvailableSizes();
  }

  /**
   * GET /products/filters/price-range
   * 
   * Lấy khoảng giá (min/max) của tất cả sản phẩm
   * Dùng để hiển thị slider giá
   */
  @Get('filters/price-range')
  async getPriceRange() {
    return this.productsService.getPriceRanges();
  }

  // ============================================================
  // SEARCH - Endpoint riêng cho tìm kiếm
  // ============================================================

  /**
   * GET /products/search/query?q=keyword
   * 
   * Endpoint tìm kiếm riêng biệt
   * Có thể dùng thay thế query param search
   */
  @Get('search/query')
  async search(
    @Query('q') keyword: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
  ) {
    return this.productsService.search(keyword, page, limit);
  }

  // ============================================================
  // PRODUCTS BY CATEGORY
  // ============================================================

  /**
   * GET /products/category/:categoryId
   * 
   * Lấy sản phẩm theo danh mục (phân trang)
   */
  @Get('category/:categoryId')
  async findByCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
  ) {
    return this.productsService.findByCategory(categoryId, page, limit);
  }

  // ============================================================
  // ADMIN ONLY - CRUD OPERATIONS
  // ============================================================

  /**
   * POST /products
   * 
   * Tạo sản phẩm mới
   * Chỉ Admin mới được phép (JwtAuthGuard + RolesGuard + @Roles('admin'))
   */
  @UseGuards(JwtAuthGuard, RolesGuard) // Yêu cầu đăng nhập
  @Roles('admin') // Chỉ admin
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  /**
   * PUT /products/:id
   * 
   * Cập nhật sản phẩm
   * Chỉ Admin mới được phép
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  /**
   * DELETE /products/:id
   * 
   * Xóa sản phẩm
   * Chỉ Admin mới được phép
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
