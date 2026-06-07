import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSharedSchema1720000000000 implements MigrationInterface {
  name = 'InitialSharedSchema1720000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id int NOT NULL AUTO_INCREMENT,
        email varchar(255) NOT NULL,
        password varchar(255) NOT NULL,
        role varchar(255) NOT NULL DEFAULT 'user',
        fullName varchar(255) NULL,
        phone varchar(255) NULL,
        birthDate date NULL,
        avatar varchar(255) NULL,
        resetToken varchar(255) NULL,
        resetTokenExpiry datetime NULL,
        UNIQUE KEY IDX_users_email (email),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS addresses (
        id int NOT NULL AUTO_INCREMENT,
        userId int NOT NULL,
        fullName varchar(255) NOT NULL,
        phone varchar(255) NOT NULL,
        street varchar(255) NOT NULL,
        city varchar(255) NOT NULL,
        district varchar(255) NULL,
        isDefault tinyint NOT NULL DEFAULT 0,
        PRIMARY KEY (id),
        CONSTRAINT FK_addresses_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS brands (
        id int NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        slug varchar(255) NULL,
        description text NULL,
        logo varchar(255) NULL,
        website varchar(255) NULL,
        isActive tinyint NOT NULL DEFAULT 1,
        createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id int NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        slug varchar(255) NULL,
        description text NULL,
        image varchar(255) NULL,
        isActive tinyint NOT NULL DEFAULT 1,
        displayOrder int NOT NULL DEFAULT 0,
        parentId int NULL,
        createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS products (
        id int NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        price decimal(10,2) NOT NULL,
        originalPrice decimal(10,2) NULL,
        description text NULL,
        brand varchar(255) NULL,
        sku varchar(255) NULL,
        stock int NOT NULL DEFAULT 0,
        isActive tinyint NOT NULL DEFAULT 1,
        rating int NOT NULL DEFAULT 0,
        reviewCount int NOT NULL DEFAULT 0,
        soldCount int NOT NULL DEFAULT 0,
        viewCount int NOT NULL DEFAULT 0,
        specifications json NULL,
        color varchar(255) NULL,
        size varchar(255) NULL,
        weight varchar(255) NULL,
        categoryId int NULL,
        brandId int NULL,
        tags text NULL,
        createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        CONSTRAINT FK_products_category FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL,
        CONSTRAINT FK_products_brand FOREIGN KEY (brandId) REFERENCES brands(id) ON DELETE SET NULL
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id int NOT NULL AUTO_INCREMENT,
        url varchar(255) NOT NULL,
        isPrimary tinyint NOT NULL DEFAULT 0,
        displayOrder int NOT NULL DEFAULT 0,
        altText varchar(255) NULL,
        productId int NOT NULL,
        createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        CONSTRAINT FK_product_images_product FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id int NOT NULL AUTO_INCREMENT,
        userId int NOT NULL,
        productId int NOT NULL,
        quantity int NOT NULL DEFAULT 1,
        selectedColor varchar(255) NULL,
        selectedSize varchar(255) NULL,
        productName varchar(255) NULL,
        productPrice decimal(12,2) NOT NULL DEFAULT 0,
        productImage varchar(500) NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id int NOT NULL AUTO_INCREMENT,
        orderNumber varchar(255) NOT NULL,
        userId int NOT NULL,
        status varchar(255) NOT NULL DEFAULT 'PENDING',
        paymentMethod varchar(255) NOT NULL,
        paymentStatus varchar(255) NOT NULL DEFAULT 'PENDING',
        stripeSessionId varchar(255) NULL,
        stripePaymentIntentId varchar(255) NULL,
        shippingMethod varchar(255) NOT NULL,
        subtotal decimal(12,2) NOT NULL DEFAULT 0,
        shippingFee decimal(12,2) NOT NULL DEFAULT 0,
        tax decimal(12,2) NOT NULL DEFAULT 0,
        discount decimal(12,2) NOT NULL DEFAULT 0,
        total decimal(12,2) NOT NULL,
        voucherCode varchar(100) NULL,
        shippingAddress json NOT NULL,
        createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE KEY IDX_orders_orderNumber (orderNumber),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id int NOT NULL AUTO_INCREMENT,
        orderId int NOT NULL,
        productId int NOT NULL,
        productName varchar(255) NOT NULL,
        productImage varchar(500) NULL,
        price decimal(12,2) NOT NULL,
        quantity int NOT NULL,
        selectedColor varchar(255) NULL,
        selectedSize varchar(255) NULL,
        lineTotal decimal(12,2) NOT NULL,
        PRIMARY KEY (id),
        CONSTRAINT FK_order_items_order FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_reviews (
        id int NOT NULL AUTO_INCREMENT,
        productId int NOT NULL,
        userId int NOT NULL,
        userEmail varchar(255) NULL,
        rating int NOT NULL,
        comment text NULL,
        isVisible tinyint NOT NULL DEFAULT 1,
        createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS wishlist_items (
        id int NOT NULL AUTO_INCREMENT,
        userId int NOT NULL,
        productId int NOT NULL,
        createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        UNIQUE KEY IDX_wishlist_user_product (userId, productId),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS wishlist_items');
    await queryRunner.query('DROP TABLE IF EXISTS product_reviews');
    await queryRunner.query('DROP TABLE IF EXISTS order_items');
    await queryRunner.query('DROP TABLE IF EXISTS orders');
    await queryRunner.query('DROP TABLE IF EXISTS cart_items');
    await queryRunner.query('DROP TABLE IF EXISTS product_images');
    await queryRunner.query('DROP TABLE IF EXISTS products');
    await queryRunner.query('DROP TABLE IF EXISTS categories');
    await queryRunner.query('DROP TABLE IF EXISTS brands');
    await queryRunner.query('DROP TABLE IF EXISTS addresses');
    await queryRunner.query('DROP TABLE IF EXISTS users');
  }
}
