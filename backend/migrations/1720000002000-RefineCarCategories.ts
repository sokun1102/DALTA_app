import { MigrationInterface, QueryRunner } from 'typeorm';

const carCategories = [
  {
    name: 'Track Editions',
    slug: 'track-editions',
    description: 'Circuit-focused DALTA Motors performance cars',
    image: '/images/cars/AT-APEX-WING-01.png',
    displayOrder: 2,
    sku: 'CAR-APEX-R7',
  },
  {
    name: 'Grand Tourers',
    slug: 'grand-tourers',
    description: 'Long-distance DALTA Motors performance coupes',
    image: '/images/cars/AT-MONO-RIM-08.png',
    displayOrder: 3,
    sku: 'CAR-VECTOR-GT',
  },
  {
    name: 'Electric Sports',
    slug: 'electric-sports',
    description: 'Electric DALTA Motors sport inventory',
    image: '/images/cars/AT-CERAM-BRK-03.png',
    displayOrder: 4,
    sku: 'CAR-NOVA-X',
  },
];

export class RefineCarCategories1720000002000 implements MigrationInterface {
  name = 'RefineCarCategories1720000002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [performanceCategory] = await queryRunner.query(
      `SELECT id FROM categories WHERE slug = ? LIMIT 1`,
      ['performance-cars'],
    );
    const parentId = performanceCategory?.id || null;

    for (const category of carCategories) {
      await queryRunner.query(
        `
          INSERT INTO categories (name, slug, description, image, isActive, displayOrder, parentId)
          SELECT ?, ?, ?, ?, 1, ?, ?
          WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = ?)
        `,
        [
          category.name,
          category.slug,
          category.description,
          category.image,
          category.displayOrder,
          parentId,
          category.slug,
        ],
      );

      const [categoryRow] = await queryRunner.query(
        `SELECT id FROM categories WHERE slug = ? LIMIT 1`,
        [category.slug],
      );

      if (categoryRow?.id) {
        await queryRunner.query(
          `UPDATE products SET categoryId = ? WHERE sku = ?`,
          [categoryRow.id, category.sku],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const [performanceCategory] = await queryRunner.query(
      `SELECT id FROM categories WHERE slug = ? LIMIT 1`,
      ['performance-cars'],
    );

    if (performanceCategory?.id) {
      await queryRunner.query(
        `UPDATE products SET categoryId = ? WHERE sku IN (?, ?, ?)`,
        [performanceCategory.id, ...carCategories.map((category) => category.sku)],
      );
    }

    await queryRunner.query(
      `DELETE FROM categories WHERE slug IN (?, ?, ?)`,
      carCategories.map((category) => category.slug),
    );
  }
}
