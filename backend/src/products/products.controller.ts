import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Import Guard

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // API này AI CŨNG CÓ THỂ GỌI (Không có Guard)
  @Get()
  async findAll() {
    try {
      return await this.productsService.findAll();
    } catch (error) {
      return { 
        isError: true, 
        message: error.message, 
        stack: error.stack 
      };
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  // API NÀY ĐÃ BỊ KHOÁ: CHỈ AI CÓ TOKEN (ĐĂNG NHẬP RỒI) MỚI ĐƯỢC TẠO SẢN PHẨM MỚI
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createProductDto: any) {
    return this.productsService.create(createProductDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductDto: any) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
