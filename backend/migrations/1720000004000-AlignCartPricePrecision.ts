import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlignCartPricePrecision1720000004000 implements MigrationInterface {
  name = 'AlignCartPricePrecision1720000004000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('cart_items');
    const productPrice = table?.findColumnByName('productPrice');

    if (productPrice) {
      await queryRunner.query(
        'ALTER TABLE cart_items MODIFY productPrice decimal(14,2) NOT NULL DEFAULT 0',
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('cart_items');
    const productPrice = table?.findColumnByName('productPrice');

    if (productPrice) {
      await queryRunner.query(
        'ALTER TABLE cart_items MODIFY productPrice decimal(12,2) NOT NULL DEFAULT 0',
      );
    }
  }
}
