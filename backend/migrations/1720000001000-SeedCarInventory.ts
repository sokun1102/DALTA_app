import { MigrationInterface, QueryRunner } from 'typeorm';

type CarSeed = {
  name: string;
  sku: string;
  type: string;
  price: number;
  originalPrice: number;
  stock: number;
  rating: number;
  reviewCount: number;
  soldCount: number;
  color: string;
  power: string;
  acceleration: string;
  topSpeed: string;
  drivetrain: string;
  fuel: string;
  description: string;
  image: string;
  accent: string;
};

const cars: CarSeed[] = [
  {
    name: 'Cánh Gió Đuôi Carbon Ép Apex',
    sku: 'AT-APEX-WING-01',
    type: 'Khí động học',
    price: 120000000,
    originalPrice: 140000000,
    stock: 5,
    rating: 4.9,
    reviewCount: 18,
    soldCount: 7,
    color: 'Carbon bóng / nhám',
    power: 'Carbon Ép (Forged Carbon)',
    acceleration: '-8.5 kg',
    topSpeed: '+180 kg Lực ép gầm',
    drivetrain: 'AEROTEC',
    fuel: 'Autoclave',
    description:
      'Cánh gió đuôi khí động học chế tạo bằng carbon ép trong lò hấp autoclave áp suất cao, tối ưu lực ép gầm và giảm tối đa lực cản không khí ở tốc độ cao.',
    image: '/images/cars/apex-r7.png',
    accent: '#e11d48',
  },
  {
    name: 'Hệ Thống Ống Xả Titanium Cổ Van Cao Cấp',
    sku: 'AT-TITAN-EXH-02',
    type: 'Động cơ',
    price: 280000000,
    originalPrice: 310000000,
    stock: 3,
    rating: 5.0,
    reviewCount: 14,
    soldCount: 11,
    color: 'Titanium tự nhiên',
    power: 'Titanium Grade 5',
    acceleration: '-14.0 kg',
    topSpeed: '+18 HP Công suất',
    drivetrain: 'AEROTEC',
    fuel: 'Van hơi biến thiên',
    description:
      'Hệ thống ống xả xe đua siêu nhẹ làm bằng hợp kim titanium siêu chịu nhiệt. Có van biến thiên thông minh tích hợp trực tiếp theo chế độ lái của ECU.',
    image: '/images/cars/vector-gt.png',
    accent: '#f59e0b',
  },
  {
    name: 'Bộ Đĩa Phanh Gốm Carbon Ceramic-Matrix',
    sku: 'AT-CERAM-BRK-03',
    type: 'Hệ thống phanh',
    price: 350000000,
    originalPrice: 380000000,
    stock: 8,
    rating: 4.8,
    reviewCount: 21,
    soldCount: 16,
    color: 'Xám gốm carbon',
    power: 'Silicon Carbide Matrix',
    acceleration: '-18.0 kg',
    topSpeed: 'Không hao hụt (Zero Fade)',
    drivetrain: 'Brembo Spec',
    fuel: 'Thông gió xuyên tâm',
    description:
      'Đĩa phanh gốm carbon thông gió chịu được nhiệt độ ma sát cực hạn lên đến 1000°C. Đảm bảo hiệu suất phanh tối đa và loại bỏ hoàn toàn hiện tượng mất phanh do quá nhiệt.',
    image: '/images/cars/nova-x.png',
    accent: '#38bdf8',
  },
];

export class SeedCarInventory1720000001000 implements MigrationInterface {
  name = 'SeedCarInventory1720000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE products
      MODIFY price decimal(14,2) NOT NULL,
      MODIFY originalPrice decimal(14,2) NULL
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX IDX_products_sku ON products (sku)`);

    await queryRunner.query(
      `
        INSERT INTO categories (name, slug, description, image, isActive, displayOrder)
        SELECT ?, ?, ?, ?, 1, 1
        WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = ?)
      `,
      [
        'Performance Cars',
        'performance-cars',
        'High-performance DALTA Motors sport car inventory',
        '/images/cars/apex-r7.png',
        'performance-cars',
      ],
    );

    await queryRunner.query(
      `
        INSERT INTO brands (name, slug, description, logo, website, isActive)
        SELECT ?, ?, ?, ?, ?, 1
        WHERE NOT EXISTS (SELECT 1 FROM brands WHERE slug = ?)
      `,
      [
        'DALTA Motors',
        'dalta-motors',
        'Performance cars and cinematic engineering by DALTA',
        '/images/cars/apex-r7.png',
        'https://dalta.local',
        'dalta-motors',
      ],
    );

    const [categoryRows] = await queryRunner.query(
      `SELECT id FROM categories WHERE slug = ? LIMIT 1`,
      ['performance-cars'],
    );
    const [brandRows] = await queryRunner.query(
      `SELECT id FROM brands WHERE slug = ? LIMIT 1`,
      ['dalta-motors'],
    );
    const categoryId = categoryRows?.id;
    const brandId = brandRows?.id;

    for (const car of cars) {
      const specifications = JSON.stringify({
        type: car.type,
        power: car.power,
        acceleration: car.acceleration,
        topSpeed: car.topSpeed,
        drivetrain: car.drivetrain,
        fuel: car.fuel,
        displayPrice: car.price >= 1000000000 
          ? `${(car.price / 1000000000).toFixed(1)} tỷ VND`
          : `${(car.price / 1000000).toFixed(1)} triệu VND`,
        accent: car.accent,
      });

      await queryRunner.query(
        `
          INSERT INTO products (
            name, price, originalPrice, description, brand, sku, stock, isActive,
            rating, reviewCount, soldCount, viewCount, specifications, color, size,
            weight, categoryId, brandId, tags
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            price = VALUES(price),
            originalPrice = VALUES(originalPrice),
            description = VALUES(description),
            brand = VALUES(brand),
            stock = VALUES(stock),
            isActive = VALUES(isActive),
            rating = VALUES(rating),
            reviewCount = VALUES(reviewCount),
            soldCount = VALUES(soldCount),
            specifications = VALUES(specifications),
            color = VALUES(color),
            size = VALUES(size),
            weight = VALUES(weight),
            categoryId = VALUES(categoryId),
            brandId = VALUES(brandId),
            tags = VALUES(tags)
        `,
        [
          car.name,
          car.price,
          car.originalPrice,
          car.description,
          'DALTA Motors',
          car.sku,
          car.stock,
          car.rating,
          car.reviewCount,
          car.soldCount,
          specifications,
          car.color,
          car.type,
          car.power,
          categoryId,
          brandId,
          `car,performance,${car.fuel.toLowerCase()},${car.drivetrain.toLowerCase()}`,
        ],
      );

      await queryRunner.query(
        `
          INSERT INTO product_images (url, isPrimary, displayOrder, altText, productId)
          SELECT ?, 1, 0, ?, p.id
          FROM products p
          WHERE p.sku = ?
            AND NOT EXISTS (
              SELECT 1 FROM product_images pi WHERE pi.productId = p.id AND pi.url = ?
            )
        `,
        [car.image, car.name, car.sku, car.image],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const skus = [
      'CAR-APEX-R7', 'CAR-VECTOR-GT', 'CAR-NOVA-X',
      'AT-APEX-WING-01', 'AT-TITAN-EXH-02', 'AT-CERAM-BRK-03'
    ];
    await queryRunner.query(
      `
        DELETE pi FROM product_images pi
        INNER JOIN products p ON p.id = pi.productId
        WHERE p.sku IN (?, ?, ?, ?, ?, ?)
      `,
      skus,
    );
    await queryRunner.query(`DELETE FROM products WHERE sku IN (?, ?, ?, ?, ?, ?)`, skus);
    await queryRunner.query(`DROP INDEX IDX_products_sku ON products`);
    await queryRunner.query(`
      ALTER TABLE products
      MODIFY price decimal(10,2) NOT NULL,
      MODIFY originalPrice decimal(10,2) NULL
    `);
  }
}
