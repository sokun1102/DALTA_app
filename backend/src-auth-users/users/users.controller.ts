import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname, join } from 'path';
import { renameSync, unlinkSync } from 'fs';
import { JwtAuthGuard } from '../../src-shared/guards/jwt-auth.guard';
import { Roles } from '../../src-shared/decorators/roles.decorator';
import { RolesGuard } from '../../src-shared/guards/roles.guard';
import { UsersService } from './users.service';
import { AddressDto, UpdateAddressDto } from './dto/address.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req) {
    return this.usersService.findById(req.user.userId);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Req() req, @Body() body: UpdateProfileDto) {
    return this.usersService.update(req.user.userId, {
      ...body,
      birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
    });
  }

  @Post('profile/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar', {
    dest: 'uploads/avatars',
    limits: { fileSize: 2 * 1024 * 1024 },
  }))
  async uploadAvatar(@Req() req, @UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Avatar file is required');
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
      process.env.PUBLIC_AUTH_USERS_URL ||
      `http://localhost:${process.env.AUTH_USERS_PORT || process.env.PORT || 3000}`;
    const avatar = `${publicBaseUrl}/uploads/avatars/${fileName}`;
    return this.usersService.update(req.user.userId, { avatar });
  }

  @Get('addresses')
  @UseGuards(JwtAuthGuard)
  async getAddresses(@Req() req) {
    return this.usersService.getAddresses(req.user.userId);
  }

  @Get('addresses/:id')
  @UseGuards(JwtAuthGuard)
  async getAddress(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.usersService.getAddress(req.user.userId, id);
  }

  @Post('addresses')
  @UseGuards(JwtAuthGuard)
  async addAddress(@Req() req, @Body() body: AddressDto) {
    return this.usersService.addAddress(req.user.userId, body);
  }

  @Put('addresses/:id')
  @UseGuards(JwtAuthGuard)
  async updateAddress(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() body: UpdateAddressDto) {
    return this.usersService.updateAddress(req.user.userId, id, body);
  }

  @Delete('addresses/:id')
  @UseGuards(JwtAuthGuard)
  async deleteAddress(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteAddress(req.user.userId, id);
  }

  @Put('addresses/:id/default')
  @UseGuards(JwtAuthGuard)
  async setDefaultAddress(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.usersService.setDefaultAddress(req.user.userId, id);
  }
}
