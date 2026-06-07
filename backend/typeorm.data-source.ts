import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Address } from './src-auth-users/users/address.entity';
import { User } from './src-auth-users/users/user.entity';
import { CartItem } from './src-cart/src/cart/entities/cart-item.entity';
import { Brand } from './src-products/src/entities/brand.entity';
import { Category as ProductCategory } from './src-products/src/entities/category.entity';
import { ProductImage } from './src-products/src/entities/product-image.entity';
import { ProductReview } from './src-products/src/entities/product-review.entity';
import { Product } from './src-products/src/entities/product.entity';
import { WishlistItem } from './src-products/src/entities/wishlist-item.entity';
import { OrderItem } from './src-orders/src/orders/entities/order-item.entity';
import { Order } from './src-orders/src/orders/entities/order.entity';

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dalta_db',
  entities: [
    User,
    Address,
    Brand,
    ProductCategory,
    Product,
    ProductImage,
    CartItem,
    Order,
    OrderItem,
    ProductReview,
    WishlistItem,
  ],
  migrations: ['migrations/*{.ts,.js}'],
  synchronize: false,
});
