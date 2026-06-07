import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoucherService } from '../promotions/voucher.service';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { SettingsController } from '../settings/settings.controller';
import { CheckoutSettingsService } from '../settings/checkout-settings.service';
import { CmsFeaturesService } from '../settings/cms-features.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 3,
    }),
  ],
  controllers: [OrdersController, SettingsController],
  providers: [OrdersService, VoucherService, CheckoutSettingsService, CmsFeaturesService],
  exports: [CmsFeaturesService],
})
export class OrdersModule {}
