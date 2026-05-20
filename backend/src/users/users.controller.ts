import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Admin: xem tất cả user
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll() {
    return this.usersService.findAll();
  }

  // Lấy thông tin cá nhân
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req) {
    return this.usersService.findById(req.user.userId);
  }

  // Cập nhật thông tin cá nhân
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Req() req, @Body() body: any) {
    const { fullName, phone, birthDate, avatar } = body;
    return this.usersService.update(req.user.userId, { fullName, phone, birthDate, avatar });
  }

  // Lấy danh sách địa chỉ
  @Get('addresses')
  @UseGuards(JwtAuthGuard)
  async getAddresses(@Req() req) {
    return this.usersService.getAddresses(req.user.userId);
  }

  // Thêm địa chỉ mới
  @Post('addresses')
  @UseGuards(JwtAuthGuard)
  async addAddress(@Req() req, @Body() body: any) {
    return this.usersService.addAddress(req.user.userId, body);
  }

  // Cập nhật địa chỉ
  @Put('addresses/:id')
  @UseGuards(JwtAuthGuard)
  async updateAddress(@Req() req, @Param('id') id: string, @Body() body: any) {
    return this.usersService.updateAddress(req.user.userId, +id, body);
  }

  // Xóa địa chỉ
  @Delete('addresses/:id')
  @UseGuards(JwtAuthGuard)
  async deleteAddress(@Req() req, @Param('id') id: string) {
    return this.usersService.deleteAddress(req.user.userId, +id);
  }

  // Đặt địa chỉ mặc định
  @Put('addresses/:id/default')
  @UseGuards(JwtAuthGuard)
  async setDefaultAddress(@Req() req, @Param('id') id: string) {
    return this.usersService.setDefaultAddress(req.user.userId, +id);
  }
}
