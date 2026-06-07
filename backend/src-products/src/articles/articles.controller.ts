import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { renameSync, unlinkSync } from 'fs';
import { extname, join } from 'path';
import { Roles } from '../../../src-shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../src-shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../src-shared/guards/roles.guard';
import { ArticlesService } from './articles.service';
import { ArticleDto } from './dto/article.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  findAll(@Query('includeDrafts') includeDrafts?: string) {
    return this.articlesService.findAll(includeDrafts === 'true');
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('includeDrafts') includeDrafts?: string,
  ) {
    return this.articlesService.findOne(id, includeDrafts === 'true');
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: ArticleDto) {
    return this.articlesService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: ArticleDto) {
    return this.articlesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.remove(id);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('image', {
    dest: 'uploads/cms',
    limits: { fileSize: 4 * 1024 * 1024 },
  }))
  uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)) {
      try {
        unlinkSync(file.path);
      } catch (err) {}
      throw new BadRequestException('Only JPG, PNG, WEBP or GIF images are allowed');
    }
    const ext = extname(file.originalname || '').toLowerCase() || '.jpg';
    const fileName = `upload_${Date.now()}${ext}`;
    const finalPath = join(file.destination, fileName);
    try {
      renameSync(file.path, finalPath);
    } catch (err) {
      throw new BadRequestException('Failed to save file: ' + err.message);
    }

    const publicBaseUrl =
      process.env.PUBLIC_PRODUCTS_URL ||
      `http://localhost:${process.env.PRODUCTS_PORT || process.env.PORT || 3001}`;
    return { url: `${publicBaseUrl}/uploads/cms/${fileName}` };
  }
}
