import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddOrderItemSelections1720000007000 implements MigrationInterface {
  name = 'AddOrderItemSelections1720000007000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('order_items');
    if (!table) return;

    if (!table.findColumnByName('selectedColor')) {
      await queryRunner.addColumn(
        'order_items',
        new TableColumn({
          name: 'selectedColor',
          type: 'varchar',
          length: '100',
          isNullable: true,
        }),
      );
    }

    if (!table.findColumnByName('selectedSize')) {
      await queryRunner.addColumn(
        'order_items',
        new TableColumn({
          name: 'selectedSize',
          type: 'varchar',
          length: '100',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('order_items');
    if (!table) return;

    if (table.findColumnByName('selectedSize')) {
      await queryRunner.dropColumn('order_items', 'selectedSize');
    }

    if (table.findColumnByName('selectedColor')) {
      await queryRunner.dropColumn('order_items', 'selectedColor');
    }
  }
}
