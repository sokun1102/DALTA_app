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
  ParseBoolPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOneWithIncrementView(id);
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

  // Admin endpoints (sẽ được bảo vệ bởi Auth)
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
