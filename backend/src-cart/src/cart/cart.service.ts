import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { CartItem } from './entities/cart-item.entity';

type ProductSnapshot = {
  id: number;
  name: string;
  price: number | string;
  stock?: number | string;
  isActive?: boolean;
  sku?: string;
  brand?: string;
  brandEntity?: { name?: string };
  images?: Array<{ url: string; isPrimary?: boolean }>;
};

@Injectable()
export class CartService {
  private readonly productsServiceUrl =
    process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3001';

  constructor(
    @InjectRepository(CartItem)
    private cartRepository: Repository<CartItem>,
    private readonly httpService: HttpService,
  ) {}

  async getCart(userId: number) {
    const items = await this.cartRepository.find({
      where: { userId },
      order: { id: 'ASC' },
    });

    return items.map((item) => this.toResponse(item));
  }

  async addToCart(userId: number, dto: AddToCartDto) {
    const productId = this.normalizeProductId(dto.productId);
    const quantity = this.normalizeQuantity(dto.quantity ?? 1);
    const product = await this.getProductSnapshot(productId);
    const selectedColor = dto.color?.trim() || null;
    const selectedSize = dto.size?.trim() || null;
    const existing = await this.findMatchingItem(
      userId,
      productId,
      selectedColor,
      selectedSize,
    );
    const nextQuantity = (existing?.quantity || 0) + quantity;

    this.assertQuantityAvailable(product, nextQuantity);

    if (existing) {
      existing.quantity = nextQuantity;
      this.applyProductSnapshot(existing, product);
      return this.toResponse(await this.cartRepository.save(existing));
    }

    const newItem = this.cartRepository.create({
      userId,
      productId,
      quantity,
      selectedColor,
      selectedSize,
    });
    this.applyProductSnapshot(newItem, product);

    return this.toResponse(await this.cartRepository.save(newItem));
  }

  async updateCartItem(userId: number, itemId: number, dto: UpdateCartDto) {
    const item = await this.cartRepository.findOne({
      where: { id: itemId, userId },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    const quantity = this.normalizeQuantity(dto.quantity);
    const product = await this.getProductSnapshot(item.productId);
    this.assertQuantityAvailable(product, quantity);

    item.quantity = quantity;
    this.applyProductSnapshot(item, product);

    return this.toResponse(await this.cartRepository.save(item));
  }

  async removeFromCart(userId: number, itemId: number): Promise<void> {
    const item = await this.cartRepository.findOne({
      where: { id: itemId, userId },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartRepository.remove(item);
  }

  async clearCart(userId: number): Promise<void> {
    await this.cartRepository.delete({ userId });
  }

  private findMatchingItem(
    userId: number,
    productId: number,
    selectedColor: string | null,
    selectedSize: string | null,
  ) {
    const query = this.cartRepository
      .createQueryBuilder('item')
      .where('item.userId = :userId', { userId })
      .andWhere('item.productId = :productId', { productId });

    if (selectedColor) {
      query.andWhere('item.selectedColor = :selectedColor', { selectedColor });
    } else {
      query.andWhere('item.selectedColor IS NULL');
    }

    if (selectedSize) {
      query.andWhere('item.selectedSize = :selectedSize', { selectedSize });
    } else {
      query.andWhere('item.selectedSize IS NULL');
    }

    return query.getOne();
  }

  private async getProductSnapshot(productId: number): Promise<ProductSnapshot> {
    try {
      const response = await this.httpService.axiosRef.get<ProductSnapshot>(
        `${this.productsServiceUrl}/products/${productId}`,
      );
      const product = this.unwrapProductResponse(response.data);

      if (!product?.id) {
        throw new NotFoundException('Product not found');
      }

      if (product.isActive === false) {
        throw new BadRequestException('Product is not available');
      }

      if (product.stock !== undefined && Number(product.stock) <= 0) {
        throw new BadRequestException('Product is out of stock');
      }

      if (!Number.isFinite(Number(product.price))) {
        throw new BadRequestException('Product price is invalid');
      }

      return product;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      if (error?.response?.status === 404) {
        throw new NotFoundException('Product not found');
      }

      throw new BadRequestException('Product snapshot is unavailable');
    }
  }

  private unwrapProductResponse(payload: ProductSnapshot | { data?: ProductSnapshot }) {
    if (payload && 'data' in payload && payload.data) {
      return payload.data;
    }

    return payload as ProductSnapshot;
  }

  private normalizeProductId(productId: number) {
    const nextProductId = Number(productId);

    if (!Number.isInteger(nextProductId) || nextProductId < 1) {
      throw new BadRequestException('Product id is invalid');
    }

    return nextProductId;
  }

  private normalizeQuantity(quantity: number) {
    const nextQuantity = Number(quantity);

    if (!Number.isInteger(nextQuantity) || nextQuantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    return nextQuantity;
  }

  private assertQuantityAvailable(product: ProductSnapshot, quantity: number) {
    if (product.stock === undefined) return;

    const stock = Number(product.stock);
    if (Number.isFinite(stock) && quantity > stock) {
      throw new BadRequestException(
        `Only ${stock} unit(s) available for this product`,
      );
    }
  }

  private applyProductSnapshot(item: CartItem, product: ProductSnapshot) {
    const image =
      product.images?.find((img) => img.isPrimary)?.url ||
      product.images?.[0]?.url ||
      null;

    item.productName = product.name || `Product #${product.id}`;
    item.productPrice = Number(product.price);
    item.productImage = image;
  }

  private toResponse(item: CartItem) {
    const productName = item.productName || `Product #${item.productId}`;
    const productPrice = Number(item.productPrice || 0);

    return {
      id: item.id,
      userId: item.userId,
      productId: item.productId,
      quantity: item.quantity,
      selectedColor: item.selectedColor,
      selectedSize: item.selectedSize,
      productName,
      productPrice,
      productImage: item.productImage,
      product: {
        id: item.productId,
        name: productName,
        price: productPrice,
        images: item.productImage
          ? [{ url: item.productImage, isPrimary: true }]
          : [],
      },
    };
  }
}
