/**
 * =====================================================
 * PRODUCTS CONTROLLER - Tầng nhận request sản phẩm
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
  DefaultValuePipe,
  BadRequestException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { renameSync, unlinkSync } from 'fs';
import { extname, join } from 'path';
import { Roles } from '../../../src-shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../src-shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../src-shared/guards/roles.guard';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateReviewVisibilityDto } from './dto/admin-review.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get('featured/home')
  async getFeaturedForHome(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.productsService.getFeatured(limit);
  }

  @Get('best-sellers/home')
  async getBestSellersForHome(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.productsService.getBestSellers(limit);
  }

  @Get('newest/home')
  async getNewestForHome(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.productsService.getNewest(limit);
  }

  @Get('filters/brands')
  async getBrands() {
    return this.productsService.getBrands();
  }

  @Get('filters/colors')
  async getColors() {
    return this.productsService.getAvailableColors();
  }

  @Get('filters/sizes')
  async getSizes() {
    return this.productsService.getAvailableSizes();
  }

  @Get('filters/price-range')
  async getPriceRange() {
    return this.productsService.getPriceRanges();
  }

  @Get('search/query')
  async search(
    @Query('q') keyword: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
  ) {
    return this.productsService.search(keyword, page, limit);
  }

  @Get('category/:categoryId')
  async findByCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
  ) {
    return this.productsService.findByCategory(categoryId, page, limit);
  }

  @Get(':id/related')
  async getRelatedProducts(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit', new DefaultValuePipe(8), ParseIntPipe) limit: number,
  ) {
    return this.productsService.getRelatedProducts(id, limit);
  }

  @Get(':id/frequently-bought-together')
  async getFrequentlyBoughtTogether(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit', new DefaultValuePipe(4), ParseIntPipe) limit: number,
  ) {
    return this.productsService.getFrequentlyBoughtTogether(id, limit);
  }

  @Get('admin/reviews/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAllReviewsForAdmin() {
    return this.productsService.findAllReviewsForAdmin();
  }

  @Put('admin/reviews/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateReviewVisibility(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReviewVisibilityDto,
  ) {
    return this.productsService.updateReviewVisibility(id, dto.isVisible !== false);
  }

  @Delete('admin/reviews/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  removeReview(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.removeReview(id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOneWithIncrementView(id);
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('image', {
    dest: 'uploads/products',
    limits: { fileSize: 4 * 1024 * 1024 },
  }))
  uploadProductImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)) {
      unlinkSync(file.path);
      throw new BadRequestException('Only JPG, PNG, WEBP or GIF images are allowed');
    }

    const ext = extname(file.originalname || '').toLowerCase() || '.jpg';
    const fileName = `${file.filename}${ext}`;
    const finalPath = join(file.destination, fileName);
    renameSync(file.path, finalPath);

    const publicBaseUrl =
      process.env.PUBLIC_PRODUCTS_URL ||
      `http://localhost:${process.env.PRODUCTS_PORT || process.env.PORT || 3001}`;
    return this.productsService.addProductImage(id, `${publicBaseUrl}/uploads/products/${fileName}`);
  }

  // Admin endpoints (sẽ được bảo vệ bởi Auth)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createProductDto: CreateProductDto, @Req() req: any) {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'N/A';
    const clientIp = Array.isArray(ip) ? ip[0] : ip;
    return this.productsService.create(createProductDto, req.user, clientIp);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'N/A';
    const clientIp = Array.isArray(ip) ? ip[0] : ip;
    return this.productsService.update(id, updateProductDto, req.user, clientIp);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'N/A';
    const clientIp = Array.isArray(ip) ? ip[0] : ip;
    return this.productsService.remove(id, req.user, clientIp);
  }
}
