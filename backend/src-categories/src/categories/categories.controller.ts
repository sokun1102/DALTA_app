/**
 * =====================================================
 * CATEGORIES CONTROLLER - Tầng nhận request danh mục
 * =====================================================
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
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Roles } from '../../../src-shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../src-shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../src-shared/guards/roles.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get('home/featured')
  async getFeaturedCategories(
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    return this.categoriesService.getFeaturedCategories(limit);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @Get(':id/with-products')
  async findOneWithProducts(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    return this.categoriesService.findOneWithProducts(id, limit);
  }

  @Get(':id/products')
  async getProductsByCategory(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', ParseIntPipe) page?: number,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    return this.categoriesService.getProductsByCategory(id, page, limit);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createCategoryDto: CreateCategoryDto, @Req() req: any) {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'N/A';
    const clientIp = Array.isArray(ip) ? ip[0] : ip;
    return this.categoriesService.create(createCategoryDto, req.user, clientIp);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'N/A';
    const clientIp = Array.isArray(ip) ? ip[0] : ip;
    return this.categoriesService.update(id, updateCategoryDto, req.user, clientIp);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'N/A';
    const clientIp = Array.isArray(ip) ? ip[0] : ip;
    return this.categoriesService.remove(id, req.user, clientIp);
  }
}
