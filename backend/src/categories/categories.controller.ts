/**
 * =====================================================
 * CATEGORIES CONTROLLER - Tầng nhận request danh mục
 * =====================================================
 * Controller tiếp nhận HTTP requests liên quan đến danh mục
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
  ParseIntPipe,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';

// Guards & Decorators
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// DTOs
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories') // Prefix: /categories
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // ============================================================
  // USER STORY 1: XEM DANH SÁCH DANH MỤC
  // ============================================================

  /**
   * GET /categories
   * 
   * Lấy danh sách tất cả danh mục đang hoạt động
   */
  @Get()
  async findAll() {
    return this.categoriesService.findAll();
  }

  /**
   * GET /categories/home/featured
   * 
   * Lấy danh mục cho trang chủ kèm sản phẩm nổi bật
   * Dùng cho homepage - section danh mục
   */
  @Get('home/featured')
  async getFeaturedCategories(
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    return this.categoriesService.getFeaturedCategories(limit);
  }

  // ============================================================
  // TÌM KIẾM & CHI TIẾT
  // ============================================================

  /**
   * GET /categories/slug/:slug
   * 
   * Tìm danh mục theo slug/name
   * Ví dụ: /categories/slug/iphone
   */
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  /**
   * GET /categories/:id
   * 
   * Lấy chi tiết một danh mục
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  /**
   * GET /categories/:id/with-products
   * 
   * Lấy danh mục kèm sản phẩm nổi bật
   */
  @Get(':id/with-products')
  async findOneWithProducts(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    return this.categoriesService.findOneWithProducts(id, limit);
  }

  /**
   * GET /categories/:id/products
   * 
   * Lấy sản phẩm theo danh mục (phân trang)
   */
  @Get(':id/products')
  async getProductsByCategory(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', ParseIntPipe) page?: number,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    return this.categoriesService.getProductsByCategory(id, page, limit);
  }

  // ============================================================
  // ADMIN ONLY - CRUD
  // ============================================================

  /**
   * POST /categories
   * 
   * Tạo danh mục mới - Chỉ Admin
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  /**
   * PUT /categories/:id
   * 
   * Cập nhật danh mục - Chỉ Admin
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  /**
   * DELETE /categories/:id
   * 
   * Xóa danh mục - Chỉ Admin
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}
