import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VoucherService } from '../promotions/voucher.service';
import { CreateGuestOrderDto, CreateOrderDto, GuestOrderItemDto } from './dto/create-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { BankTransferPaymentInstruction, Order } from './entities/order.entity';
import type {
  CreateStripeCheckoutContract,
  StripeCheckoutResponseContract,
} from '../../../src-shared/contracts';
import { CheckoutSettingsService } from '../settings/checkout-settings.service';
import { CmsFeaturesService } from '../settings/cms-features.service';

type CartItemResponse = {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  productName?: string | null;
  productPrice?: number | string;
  productImage?: string | null;
  selectedColor?: string | null;
  selectedSize?: string | null;
  product?: {
    name?: string | null;
    price?: number | string;
    images?: Array<{ url: string; isPrimary?: boolean }>;
  };
};

type AddressResponse = {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  district?: string | null;
};

type ProductResponse = {
  id: number;
  name?: string | null;
  price?: number | string;
  stock?: number;
  isActive?: boolean;
  images?: Array<{ url: string; isPrimary?: boolean }>;
};

@Injectable()
export class OrdersService {
  private readonly cartServiceUrl: string;
  private readonly usersServiceUrl: string;
  private readonly productsServiceUrl: string;
  private readonly paymentsServiceUrl: string;
  private readonly notificationsServiceUrl: string;
  private readonly internalServiceKey: string;
  private readonly bankTransferBankName: string;
  private readonly bankTransferBankFullName: string;
  private readonly bankTransferBankBin: string;
  private readonly bankTransferAccountNumber: string;
  private readonly bankTransferAccountName: string;

  constructor(
    private readonly voucherService: VoucherService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly checkoutSettingsService: CheckoutSettingsService,
    private readonly cmsFeaturesService: CmsFeaturesService,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
  ) {
    this.cartServiceUrl =
      this.configService.get<string>('CART_SERVICE_URL') || 'http://localhost:3004';
    this.usersServiceUrl =
      this.configService.get<string>('USERS_SERVICE_URL') || 'http://localhost:3000';
    this.productsServiceUrl =
      this.configService.get<string>('PRODUCTS_SERVICE_URL') || 'http://localhost:3001';
    this.paymentsServiceUrl =
      this.configService.get<string>('PAYMENTS_SERVICE_URL') || 'http://localhost:3006';
    this.notificationsServiceUrl =
      this.configService.get<string>('NOTIFICATIONS_SERVICE_URL') || 'http://localhost:3007';
    this.internalServiceKey =
      this.configService.get<string>('INTERNAL_SERVICE_KEY') ||
      'local-dev-internal-key';
    this.bankTransferBankName =
      this.configService.get<string>('BANK_TRANSFER_BANK_NAME') || 'BIDV';
    this.bankTransferBankFullName =
      this.configService.get<string>('BANK_TRANSFER_BANK_FULL_NAME') ||
      'Ngân hàng TMCP Đầu tư & Phát triển Việt Nam';
    this.bankTransferBankBin =
      this.configService.get<string>('BANK_TRANSFER_BANK_BIN') || '970418';
    this.bankTransferAccountNumber =
      this.configService.get<string>('BANK_TRANSFER_ACCOUNT_NUMBER') || '1303108973';
    this.bankTransferAccountName =
      this.configService.get<string>('BANK_TRANSFER_ACCOUNT_NAME') || 'DANG NHUT TRUONG';
  }

  async findMine(userId: number): Promise<Order[]> {
    const orders = await this.ordersRepository.find({
      where: { userId, hiddenFromCustomer: false },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
    return orders.map((order) => this.withPaymentInstruction(order));
  }

  async findAllForAdmin(): Promise<Order[]> {
    const orders = await this.ordersRepository.find({
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
    return orders.map((order) => this.withPaymentInstruction(order));
  }

  async findOne(userId: number, id: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id, userId, hiddenFromCustomer: false },
      relations: ['items'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return this.withPaymentInstruction(order);
  }

  async updateForAdmin(
    id: number,
    data: { status?: string; paymentStatus?: string },
    adminUser: { userId: number; email: string },
    clientIp: string,
  ): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!order) throw new NotFoundException('Order not found');

    const prevStatus = order.status;
    const prevPaymentStatus = order.paymentStatus;

    if (data.status) {
      order.status = data.status;
    }

    if (data.paymentStatus) {
      order.paymentStatus = data.paymentStatus;
      if (data.paymentStatus === 'PAID' && order.status === 'PENDING') {
        order.status = 'PROCESSING';
      }
    }

    const saved = await this.ordersRepository.save(order);

    // Log audit action
    const details = `Đã cập nhật đơn hàng #${order.orderNumber}. Trạng thái: ${prevStatus} -> ${order.status}. Trạng thái thanh toán: ${prevPaymentStatus} -> ${order.paymentStatus}.`;
    await this.cmsFeaturesService.logAction(adminUser, 'Cập nhật đơn hàng', details, clientIp, 'ADMIN');

    // Create notification for customer
    if (order.userId) {
      await this.cmsFeaturesService.createNotification(
        order.userId,
        'Cập nhật đơn hàng',
        `Đơn hàng #${order.orderNumber} đã cập nhật trạng thái: ${order.status} (${order.paymentStatus}).`,
        'order',
        '/orders',
      );
    }

    return this.withPaymentInstruction(saved);
  }

  async hasUserDeliveredProduct(userId: number, productId: number): Promise<boolean> {
    const deliveredItemCount = await this.orderItemsRepository
      .createQueryBuilder('item')
      .innerJoin('item.order', 'customerOrder')
      .where('item.productId = :productId', { productId })
      .andWhere('customerOrder.userId = :userId', { userId })
      .andWhere('customerOrder.status = :status', { status: 'DELIVERED' })
      .getCount();

    return deliveredItemCount > 0;
  }

  async createFromCart(
    userId: number,
    dto: CreateOrderDto,
    authorization: string,
    customerEmail?: string,
  ): Promise<Order | { order: Order; paymentUrl: string }> {
    const cartItems = await this.getCartItems(authorization);

    if (cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    this.assertPaymentMethodEnabled(dto.paymentMethod);
    await this.assertCartItemsAvailable(cartItems);

    const shippingAddress = await this.resolveShippingAddress(dto, authorization);
    const { order, orderItems } = await this.createOrderWithItems({
      userId,
      guestEmail: null,
      dto,
      cartItems,
      shippingAddress,
    });

    if (this.isStripePayment(dto.paymentMethod)) {
      const session = await this.createStripeCheckoutSession(order, orderItems);
      order.stripeSessionId = session.id;
      await this.ordersRepository.save(order);
      const savedOrder = await this.findOne(userId, order.id);
      await this.sendOrderConfirmation(customerEmail || null, savedOrder);

      // Create notification & log action
      await this.cmsFeaturesService.createNotification(
        userId,
        'Đặt hàng thành công',
        `Đơn hàng #${savedOrder.orderNumber} của bạn đã được ghi nhận. Vui lòng hoàn tất thanh toán qua Stripe.`,
        'order',
        '/orders',
      );
      await this.cmsFeaturesService.logAction(
        { userId, email: customerEmail || 'member@mail.com' },
        'Đặt hàng mới (Stripe)',
        `Khách hàng đặt đơn hàng #${savedOrder.orderNumber} trị giá ${Number(savedOrder.total || 0).toLocaleString('vi-VN')} VND. Chờ thanh toán.`,
        'N/A',
        'SYSTEM',
      );

      return {
        order: savedOrder,
        paymentUrl: session.url!,
      };
    }

    await this.clearCartByAuthorization(authorization);
    const savedOrder = await this.findOne(userId, order.id);
    await this.sendOrderConfirmation(customerEmail || null, savedOrder);

    // Create notification & log action
    await this.cmsFeaturesService.createNotification(
      userId,
      'Đặt hàng thành công',
      `Đơn hàng #${savedOrder.orderNumber} của bạn đã được ghi nhận thành công. Trạng thái: ${savedOrder.status}.`,
      'order',
      '/orders',
    );
    await this.cmsFeaturesService.logAction(
      { userId, email: customerEmail || 'member@mail.com' },
      'Đặt hàng mới',
      `Khách hàng đặt đơn hàng #${savedOrder.orderNumber} trị giá ${Number(savedOrder.total || 0).toLocaleString('vi-VN')} VND qua hình thức ${savedOrder.paymentMethod}.`,
      'N/A',
      'SYSTEM',
    );

    return savedOrder;
  }

  async createGuestOrder(dto: CreateGuestOrderDto): Promise<Order> {
    const cartItems = await this.resolveGuestItems(dto.items);

    if (cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    this.assertPaymentMethodEnabled(dto.paymentMethod);

    if (this.isStripePayment(dto.paymentMethod)) {
      throw new BadRequestException('Khách vãng lai hiện chỉ hỗ trợ COD.');
    }

    const shippingAddress = await this.resolveShippingAddress(dto, '');
    const { order } = await this.createOrderWithItems({
      userId: null,
      guestEmail: dto.guestEmail.trim().toLowerCase(),
      dto,
      cartItems,
      shippingAddress,
    });

    const savedOrder = await this.findGuestOrder(order.id);
    await this.sendOrderConfirmation(dto.guestEmail, savedOrder);

    // Log audit action
    await this.cmsFeaturesService.logAction(
      null,
      'Đặt hàng mới (Khách vãng lai)',
      `Khách vãng lai (${dto.guestEmail}) đặt đơn hàng #${savedOrder.orderNumber} trị giá ${Number(savedOrder.total || 0).toLocaleString('vi-VN')} VND qua hình thức COD.`,
      'N/A',
      'SYSTEM',
    );

    return savedOrder;
  }

  private async createOrderWithItems(input: {
    userId: number | null;
    guestEmail: string | null;
    dto: CreateOrderDto;
    cartItems: CartItemResponse[];
    shippingAddress: Record<string, string>;
  }): Promise<{ order: Order; orderItems: OrderItem[] }> {
    const subtotal = input.cartItems.reduce(
      (sum, item) => sum + this.getCartItemPrice(item) * item.quantity,
      0,
    );
    const shippingFee = this.checkoutSettingsService.getShippingFee(input.dto.shippingMethod);
    const tax = this.checkoutSettingsService.getTax(subtotal);
    const voucher = this.voucherService.quote(input.dto.voucherCode, {
      subtotal,
      shippingFee,
    });
    const discount = voucher.discount;
    const total = Math.max(0, subtotal + shippingFee + tax - discount);

    return this.ordersRepository.manager.transaction(async (manager) => {
      const ordersRepository = manager.getRepository(Order);
      const orderItemsRepository = manager.getRepository(OrderItem);
      const order = await ordersRepository.save(
        ordersRepository.create({
          orderNumber: this.createOrderNumber(),
          userId: input.userId,
          guestEmail: input.guestEmail,
          status: 'PENDING',
          cancelReason: null,
          hiddenFromCustomer: false,
          customerDeletedAt: null,
          paymentMethod: input.dto.paymentMethod,
          paymentStatus: input.dto.paymentMethod === 'cod' ? 'UNPAID' : 'PENDING',
          shippingMethod: input.dto.shippingMethod,
          subtotal,
          shippingFee,
          tax,
          discount,
          total,
          voucherCode: voucher.voucherCode,
          shippingAddress: input.shippingAddress,
        }),
      );

      const orderItems = input.cartItems.map((item) => {
        const price = this.getCartItemPrice(item);
        const image = this.getCartItemImage(item);

        return orderItemsRepository.create({
          orderId: order.id,
          productId: item.productId,
          productName: item.productName || item.product?.name || `Product #${item.productId}`,
          productImage: image,
          price,
          quantity: item.quantity,
          selectedColor: item.selectedColor || null,
          selectedSize: item.selectedSize || null,
          lineTotal: price * item.quantity,
        });
      });

      await orderItemsRepository.save(orderItems);
      return { order, orderItems };
    });
  }

  private async findGuestOrder(id: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return this.withPaymentInstruction(order);
  }

  private withPaymentInstruction<T extends Order>(order: T): T {
    if (order.paymentMethod !== 'bank_transfer') return order;

    order.paymentInstruction = this.createBankTransferInstruction(order);
    return order;
  }

  private createBankTransferInstruction(order: Order): BankTransferPaymentInstruction {
    const settings = this.checkoutSettingsService.getSettings();
    const amount = Math.round(Number(order.total || 0));
    const content = order.orderNumber;
    const qrUrl = this.createVietQrUrl(amount, content);

    return {
      type: 'bank_transfer',
      bankName: settings.bankTransfer.bankName,
      bankFullName: settings.bankTransfer.bankFullName,
      bankBin: settings.bankTransfer.bankBin,
      accountNumber: settings.bankTransfer.accountNumber,
      accountName: settings.bankTransfer.accountName,
      amount,
      content,
      qrUrl,
    };
  }

  private createVietQrUrl(amount: number, content: string): string {
    const settings = this.checkoutSettingsService.getSettings();
    const params = new URLSearchParams({
      amount: String(amount),
      addInfo: content,
      accountName: settings.bankTransfer.accountName,
    });

    return `https://img.vietqr.io/image/${settings.bankTransfer.bankBin}-${settings.bankTransfer.accountNumber}-compact2.png?${params.toString()}`;
  }

  async markStripeCheckoutCompleted(
    sessionId: string,
    paymentIntentId?: string | null,
  ): Promise<void> {
    const order = await this.ordersRepository.findOne({
      where: { stripeSessionId: sessionId },
    });
    if (!order) return;

    order.paymentStatus = 'PAID';
    order.status = 'PROCESSING';
    order.stripePaymentIntentId = paymentIntentId || null;
    await this.ordersRepository.save(order);
    if (order.userId) {
      await this.clearCartByUserId(order.userId);

      // Create notification
      await this.cmsFeaturesService.createNotification(
        order.userId,
        'Thanh toán thành công',
        `Đơn hàng #${order.orderNumber} đã thanh toán thành công qua Stripe.`,
        'order',
        '/orders',
      );
    }

    // Log action
    await this.cmsFeaturesService.logAction(
      order.userId ? { userId: order.userId, email: order.guestEmail || 'member@mail.com' } : null,
      'Thanh toán Stripe thành công',
      `Đơn hàng #${order.orderNumber} hoàn tất thanh toán qua cổng Stripe.`,
      'Stripe Webhook',
      'SYSTEM',
    );
  }

  async markManualPaymentPaid(id: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!order) throw new NotFoundException('Order not found');

    if (order.paymentMethod !== 'bank_transfer') {
      throw new BadRequestException('Only bank transfer orders can be marked as paid');
    }

    order.paymentStatus = 'PAID';
    order.status = 'PROCESSING';
    const saved = await this.ordersRepository.save(order);

    // Create notification
    if (order.userId) {
      await this.cmsFeaturesService.createNotification(
        order.userId,
        'Xác nhận thanh toán thành công',
        `Đơn hàng #${order.orderNumber} chuyển khoản đã được xác nhận thanh toán thành công.`,
        'order',
        '/orders',
      );
    }

    // Log action
    await this.cmsFeaturesService.logAction(
      null,
      'Xác nhận thanh toán thủ công',
      `Xác nhận thanh toán chuyển khoản thành công cho đơn hàng #${order.orderNumber}.`,
      'System API',
      'ADMIN',
    );

    return this.withPaymentInstruction(saved);
  }

  async cancel(userId: number, id: number, reason: string): Promise<Order> {
    const order = await this.findOne(userId, id);
    if (order.status !== 'PENDING') {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    order.status = 'CANCELLED';
    order.cancelReason = reason.trim();
    const saved = await this.ordersRepository.save(order);

    // Create notification
    await this.cmsFeaturesService.createNotification(
      userId,
      'Hủy đơn hàng',
      `Đơn hàng #${order.orderNumber} đã được hủy thành công. Lý do: ${order.cancelReason}`,
      'order',
      '/orders',
    );

    // Log action
    await this.cmsFeaturesService.logAction(
      { userId, email: order.guestEmail || 'member@mail.com' },
      'Hủy đơn hàng',
      `Khách hàng đã hủy đơn hàng #${order.orderNumber}. Lý do: ${order.cancelReason}`,
      'N/A',
      'SYSTEM',
    );

    return saved;
  }

  async hideFromHistory(userId: number, id: number): Promise<{ deleted: true }> {
    const order = await this.findOne(userId, id);

    if (!['CANCELLED', 'DELIVERED'].includes(order.status)) {
      throw new BadRequestException('Only delivered or cancelled orders can be removed from history');
    }

    order.hiddenFromCustomer = true;
    order.customerDeletedAt = new Date();
    await this.ordersRepository.save(order);
    return { deleted: true };
  }

  private async resolveShippingAddress(
    dto: CreateOrderDto,
    authorization: string,
  ): Promise<Record<string, string>> {
    if (dto.addressId) {
      const address = await this.getAddress(dto.addressId, authorization);

      return {
        fullName: address.fullName,
        phone: address.phone,
        street: address.street,
        district: address.district || '',
        city: address.city,
      };
    }

    if (!dto.shippingAddress) {
      throw new BadRequestException('Shipping address is required');
    }

    const requiredFields = ['fullName', 'phone', 'street', 'city'];
    for (const field of requiredFields) {
      if (!dto.shippingAddress[field]) {
        throw new BadRequestException(`${field} is required`);
      }
    }

    return dto.shippingAddress;
  }

  private createOrderNumber(): string {
    return `DLT-${Date.now().toString(36).toUpperCase()}`;
  }

  private assertPaymentMethodEnabled(paymentMethod: string): void {
    const normalizedMethod = paymentMethod === 'stripe' ? 'card' : paymentMethod;
    if (!this.checkoutSettingsService.isPaymentEnabled(normalizedMethod)) {
      throw new BadRequestException('Payment method is currently disabled');
    }
  }

  private isStripePayment(paymentMethod: string): boolean {
    return ['card', 'stripe'].includes(paymentMethod);
  }

  private async getCartItems(authorization: string): Promise<CartItemResponse[]> {
    if (!authorization) {
      throw new BadRequestException('Authorization header is required');
    }

    const response = await this.httpService.axiosRef.get<CartItemResponse[]>(
      `${this.cartServiceUrl}/cart`,
      {
        headers: { Authorization: authorization },
      },
    );

    return response.data;
  }

  private async resolveGuestItems(items: GuestOrderItemDto[]): Promise<CartItemResponse[]> {
    const resolvedItems: CartItemResponse[] = [];

    for (const item of items) {
      const product = await this.getProduct(item.productId);
      const quantity = Math.max(1, Number(item.quantity || 1));

      if (Number(product.stock || 0) < quantity) {
        throw new BadRequestException(
          `${product.name || `Product #${item.productId}`} không đủ tồn kho`,
        );
      }

      resolvedItems.push({
        id: item.productId,
        userId: 0,
        productId: product.id,
        quantity,
        productName: product.name || `Product #${product.id}`,
        productPrice: Number(product.price || 0),
        productImage: this.getProductImage(product),
        selectedColor: item.selectedColor || null,
        selectedSize: item.selectedSize || null,
      });
    }

    return resolvedItems;
  }

  private async assertCartItemsAvailable(items: CartItemResponse[]): Promise<void> {
    for (const item of items) {
      const product = await this.getProduct(item.productId);
      const quantity = Math.max(1, Number(item.quantity || 1));
      const productName = product.name || item.productName || `Product #${item.productId}`;

      if (product.isActive === false) {
        throw new BadRequestException(`${productName} hiện không còn được bán`);
      }

      if (product.stock === undefined || product.stock === null) {
        continue;
      }

      const stock = Number(product.stock);
      if (Number.isFinite(stock) && stock < quantity) {
        throw new BadRequestException(`${productName} chỉ còn ${Math.max(0, stock)} sản phẩm trong kho`);
      }
    }
  }

  private async getProduct(productId: number): Promise<ProductResponse> {
    try {
      const response = await this.httpService.axiosRef.get<ProductResponse>(
        `${this.productsServiceUrl}/products/${productId}`,
      );
      return response.data;
    } catch (error) {
      if (error?.response?.status === 404) {
        throw new NotFoundException(`Sản phẩm #${productId} không tồn tại`);
      }

      throw new ServiceUnavailableException('Products Service is unavailable');
    }
  }

  private async getAddress(
    addressId: number,
    authorization: string,
  ): Promise<AddressResponse> {
    if (!authorization) {
      throw new BadRequestException('Authorization header is required');
    }

    try {
      const response = await this.httpService.axiosRef.get<AddressResponse>(
        `${this.usersServiceUrl}/users/addresses/${addressId}`,
        {
          headers: { Authorization: authorization },
        },
      );

      return response.data;
    } catch (error) {
      if (error?.response?.status === 404) {
        throw new NotFoundException('Address not found');
      }

      throw new ServiceUnavailableException('Users Service is unavailable');
    }
  }

  private async clearCartByAuthorization(authorization: string): Promise<void> {
    await this.httpService.axiosRef.delete(`${this.cartServiceUrl}/cart`, {
      headers: { Authorization: authorization },
    });
  }

  private async clearCartByUserId(userId: number): Promise<void> {
    await this.httpService.axiosRef.delete(
      `${this.cartServiceUrl}/cart/internal/users/${userId}`,
      {
        headers: { 'x-internal-service-key': this.internalServiceKey },
      },
    );
  }

  private async createStripeCheckoutSession(
    order: Order,
    items: OrderItem[],
  ): Promise<StripeCheckoutResponseContract> {
    try {
      const payload: CreateStripeCheckoutContract = {
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          userId: order.userId ?? 0,
          shippingFee: Number(order.shippingFee),
          tax: Number(order.tax),
        },
        items: items.map((item) => ({
          productName: item.productName,
          productImage: item.productImage,
          price: Number(item.price),
          quantity: item.quantity,
        })),
      };

      const response = await this.httpService.axiosRef.post<StripeCheckoutResponseContract>(
        `${this.paymentsServiceUrl}/payments/stripe/checkout`,
        payload,
        {
          headers: { 'x-internal-service-key': this.internalServiceKey },
        },
      );

      return response.data;
    } catch {
      throw new ServiceUnavailableException('Payments Service is unavailable');
    }
  }

  private async sendOrderConfirmation(email: string | null, order: Order): Promise<void> {
    if (!email) return;

    try {
      await this.httpService.axiosRef.post(
        `${this.notificationsServiceUrl}/notifications/email/order-confirmation`,
        {
          to: email,
          orderNumber: order.orderNumber,
          total: Number(order.total || 0),
          status: order.status,
          paymentMethod: order.paymentMethod,
        },
        {
          headers: { 'x-internal-service-key': this.internalServiceKey },
        },
      );
    } catch {
      // Order creation must remain successful even when email delivery is unavailable.
    }
  }

  private getCartItemPrice(item: CartItemResponse): number {
    return Number(item.productPrice ?? item.product?.price ?? 0);
  }

  private getCartItemImage(item: CartItemResponse): string | null {
    return (
      item.productImage ||
      item.product?.images?.find((img) => img.isPrimary)?.url ||
      item.product?.images?.[0]?.url ||
      null
    );
  }

  private getProductImage(product: ProductResponse): string | null {
    return (
      product.images?.find((img) => img.isPrimary)?.url ||
      product.images?.[0]?.url ||
      null
    );
  }
}
