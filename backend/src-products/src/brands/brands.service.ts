/**
 * =====================================================
 * BRANDS SERVICE - Tầng xử lý nghiệp vụ thương hiệu
 * =====================================================
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private brandsRepository: Repository<Brand>,
  ) {}

  async findAll(): Promise<Brand[]> {
    return this.brandsRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Brand> {
    const brand = await this.brandsRepository.findOne({ where: { id } });
    if (!brand) {
      throw new NotFoundException(`Thương hiệu #${id} không tồn tại`);
    }
    return brand;
  }

  async findBySlug(slug: string): Promise<Brand> {
    const brand = await this.brandsRepository.findOne({
      where: [{ slug }, { name: slug }],
    });
    if (!brand) {
      throw new NotFoundException(`Thương hiệu "${slug}" không tồn tại`);
    }
    return brand;
  }

  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
    const brand = this.brandsRepository.create(createBrandDto);
    return this.brandsRepository.save(brand);
  }

  async update(id: number, updateBrandDto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.findOne(id);
    Object.assign(brand, updateBrandDto);
    return this.brandsRepository.save(brand);
  }

  async remove(id: number): Promise<void> {
    const brand = await this.findOne(id);
    await this.brandsRepository.remove(brand);
  }
}
