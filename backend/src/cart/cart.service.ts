import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartRepository: Repository<CartItem>,
  ) {}

  async getCart(userId: number): Promise<CartItem[]> {
    return this.cartRepository.find({ where: { userId } });
  }

  async addToCart(userId: number, dto: AddToCartDto): Promise<CartItem> {
    const existing = await this.cartRepository.findOne({
      where: { userId, productId: dto.productId },
    });

    if (existing) {
      existing.quantity += dto.quantity;
      return this.cartRepository.save(existing);
    }

    const newItem = this.cartRepository.create({
      userId,
      productId: dto.productId,
      quantity: dto.quantity,
    });
    return this.cartRepository.save(newItem);
  }

  async updateCartItem(userId: number, itemId: number, dto: UpdateCartDto): Promise<CartItem> {
    const item = await this.cartRepository.findOne({
      where: { id: itemId, userId },
    });

    if (!item) {
      throw new NotFoundException(`Không tìm thấy sản phẩm trong giỏ hàng`);
    }

    item.quantity = dto.quantity;
    return this.cartRepository.save(item);
  }

  async removeFromCart(userId: number, itemId: number): Promise<void> {
    const item = await this.cartRepository.findOne({
      where: { id: itemId, userId },
    });

    if (!item) {
      throw new NotFoundException(`Không tìm thấy sản phẩm trong giỏ hàng`);
    }

    await this.cartRepository.remove(item);
  }

  async clearCart(userId: number): Promise<void> {
    await this.cartRepository.delete({ userId });
  }
}
