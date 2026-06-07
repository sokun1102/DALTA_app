import {
  Body,
  Controller,
  Get,
  Put,
  Post,
  Param,
  Req,
  Headers,
  UseGuards,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Roles } from '../../../src-shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../src-shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../src-shared/guards/roles.guard';
import { CheckoutSettingsService } from './checkout-settings.service';
import { CmsFeaturesService } from './cms-features.service';
import { CheckoutSettingsDto } from './dto/checkout-settings.dto';
import * as fs from 'fs';
import { join } from 'path';

@Controller('settings')
export class SettingsController {
  private readonly homepageStoragePath = join(process.cwd(), 'uploads', 'cms', 'homepage-settings.json');

  private defaultHomepageSettings = {
    heroTitle: "PHỤ TÙNG\nHIỆU NĂNG",
    heroSubtitle: "CẤU HÌNH RACING SPEC ĐÃ HIỆU CHUẨN",
    heroText: "Bộ phụ tùng khí động học carbon ép, hệ thống xả hợp kim titanium và các linh kiện điều khiển lập trình nơ-ron được thiết kế cho đua xe chính xác.",
    heroImage: "",
    partnerBremboDesc: "HỆ THỐNG PHANH ĐUA // HEO DẦU NGUYÊN KHỐI",
    partnerMichelinDesc: "LỐP ĐUA CHUYÊN DỤNG // LỰC BÁM ĐƯỜNG ĐUA 1.88G",
    partnerOhlinsDesc: "GIẢM CHẤN VAN THÍCH ỨNG // DẦU THỦY LỰC CHỦ ĐỘNG",
    partnerRecaroDesc: "KHUNG GHẾ KEVLAR NGUYÊN KHỐI // CĂNG ĐAI SINH HỌC",
    partnerAlcantaraDesc: "BỌC ALCANTARA SIÊU BÁM // BỀ MẶT CHỐNG TĨNH ĐIỆN",
    featuredProductIds: [],
    materialFilters: [
      { label: 'Carbon Fiber', key: 'carbon' },
      { label: 'Titanium', key: 'titan' },
      { label: 'Nhôm CNC', key: 'nhôm' },
      { label: 'Carbon Ceramic', key: 'gốm' }
    ]
  };

  constructor(
    private readonly checkoutSettingsService: CheckoutSettingsService,
    private readonly cmsFeaturesService: CmsFeaturesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('checkout')
  getCheckoutSettings() {
    return this.checkoutSettingsService.getSettings();
  }

  @Put('checkout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateCheckoutSettings(@Body() dto: CheckoutSettingsDto, @Req() req) {
    const updated = this.checkoutSettingsService.updateSettings(dto as any);
    
    // Log audit action
    const ip = req.ip || req.headers['x-forwarded-for'] || 'N/A';
    await this.cmsFeaturesService.logAction(
      req.user,
      'Cập nhật cấu hình Thanh toán',
      'Đã thay đổi cấu hình thanh toán (phí vận chuyển, thuế hoặc tài khoản ngân hàng).',
      Array.isArray(ip) ? ip[0] : ip,
      'ADMIN'
    );

    return updated;
  }

  @Get('homepage')
  getHomepageSettings() {
    try {
      if (!fs.existsSync(this.homepageStoragePath)) {
        fs.mkdirSync(join(process.cwd(), 'uploads', 'cms'), { recursive: true });
        fs.writeFileSync(this.homepageStoragePath, JSON.stringify(this.defaultHomepageSettings, null, 2), 'utf8');
        return this.defaultHomepageSettings;
      }
      const raw = fs.readFileSync(this.homepageStoragePath, 'utf8');
      return { ...this.defaultHomepageSettings, ...JSON.parse(raw) };
    } catch {
      return this.defaultHomepageSettings;
    }
  }

  @Put('homepage')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateHomepageSettings(@Body() dto: any, @Req() req) {
    try {
      fs.mkdirSync(join(process.cwd(), 'uploads', 'cms'), { recursive: true });
      const current = this.getHomepageSettings();
      const updated = { ...current, ...dto };
      fs.writeFileSync(this.homepageStoragePath, JSON.stringify(updated, null, 2), 'utf8');

      // Log audit action
      const ip = req.ip || req.headers['x-forwarded-for'] || 'N/A';
      await this.cmsFeaturesService.logAction(
        req.user,
        'Cập nhật cấu hình Trang chủ',
        'Đã cập nhật thông tin banner, mô tả đối tác hoặc bộ lọc vật liệu CMS.',
        Array.isArray(ip) ? ip[0] : ip,
        'ADMIN'
      );

      return updated;
    } catch (err) {
      throw new BadRequestException('Không thể cập nhật cấu hình trang chủ: ' + err.message);
    }
  }

  // --- CUSTOMER SUPPORT ---

  @Post('support-request')
  async createSupportRequest(
    @Body() dto: { fullName: string; email: string; subject: string; message: string }
  ) {
    if (!dto.fullName || !dto.email || !dto.subject || !dto.message) {
      throw new BadRequestException('Vui lòng điền đầy đủ thông tin: Họ tên, Email, Tiêu đề và Nội dung.');
    }
    return this.cmsFeaturesService.createSupportRequest(
      dto.fullName.trim(),
      dto.email.trim(),
      dto.subject.trim(),
      dto.message.trim()
    );
  }

  @Get('support-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getSupportRequests() {
    return this.cmsFeaturesService.getSupportRequests();
  }

  @Put('support-requests/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateSupportRequest(
    @Param('id') id: string,
    @Body() dto: { status: 'OPEN' | 'RESOLVED' },
    @Req() req
  ) {
    if (!dto.status || (dto.status !== 'OPEN' && dto.status !== 'RESOLVED')) {
      throw new BadRequestException('Trạng thái không hợp lệ.');
    }
    const ticket = await this.cmsFeaturesService.updateSupportRequest(id, dto.status);
    if (!ticket) {
      throw new BadRequestException('Không tìm thấy yêu cầu hỗ trợ.');
    }
    
    // Log audit action
    const ip = req.ip || req.headers['x-forwarded-for'] || 'N/A';
    await this.cmsFeaturesService.logAction(
      req.user,
      'Cập nhật ticket hỗ trợ',
      `Đã chuyển trạng thái yêu cầu hỗ trợ #${id} thành: ${dto.status === 'RESOLVED' ? 'Đã giải quyết' : 'Chưa giải quyết'}.`,
      Array.isArray(ip) ? ip[0] : ip,
      'ADMIN'
    );

    return ticket;
  }

  // --- USER NOTIFICATIONS ---

  @Get('notifications')
  @UseGuards(JwtAuthGuard)
  async getNotifications(@Req() req) {
    return this.cmsFeaturesService.getNotifications(req.user.userId);
  }

  @Post('notifications/read-all')
  @UseGuards(JwtAuthGuard)
  async readAllNotifications(@Req() req) {
    const updated = await this.cmsFeaturesService.readAllNotifications(req.user.userId);
    return { success: true, updated };
  }

  @Post('notifications/:id/read')
  @UseGuards(JwtAuthGuard)
  async readNotification(@Param('id') id: string, @Req() req) {
    const updated = await this.cmsFeaturesService.readNotification(req.user.userId, id);
    return { success: true, updated };
  }

  // --- ADMIN AUDIT LOGS ---

  @Get('audit-logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAuditLogs() {
    return this.cmsFeaturesService.getAuditLogs();
  }

  @Post('audit-logs/internal')
  async logActionInternal(
    @Headers('x-internal-service-key') serviceKey: string,
    @Body() dto: { user: { userId: number; email: string } | null; action: string; details: string; ip?: string; type?: 'SYSTEM' | 'ADMIN' }
  ) {
    this.assertInternalService(serviceKey);
    return this.cmsFeaturesService.logAction(
      dto.user,
      dto.action,
      dto.details,
      dto.ip || 'internal',
      dto.type || 'SYSTEM'
    );
  }

  // --- MAIL QUEUE LOGS ---

  @Get('mail-logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getMailLogs() {
    return this.cmsFeaturesService.getMailLogs();
  }

  @Post('mail-logs/internal')
  async logMailInternal(
    @Headers('x-internal-service-key') serviceKey: string,
    @Body() dto: { to: string; subject: string; status: 'SENT' | 'PENDING' | 'FAILED'; error?: string }
  ) {
    this.assertInternalService(serviceKey);
    return this.cmsFeaturesService.logMail(
      dto.to,
      dto.subject,
      dto.status,
      dto.error
    );
  }

  private assertInternalService(serviceKey: string) {
    const expectedKey =
      this.configService.get<string>('INTERNAL_SERVICE_KEY') || 'local-dev-internal-key';
    if (!serviceKey || serviceKey !== expectedKey) {
      throw new UnauthorizedException('Invalid internal service key');
    }
  }
}
