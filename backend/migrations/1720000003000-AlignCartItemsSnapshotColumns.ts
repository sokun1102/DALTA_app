import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlignCartItemsSnapshotColumns1720000003000
  implements MigrationInterface
{
  name = 'AlignCartItemsSnapshotColumns1720000003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('cart_items');
    if (!table) return;

    const ensureColumn = async (column: TableColumn) => {
      if (!table.findColumnByName(column.name)) {
        await queryRunner.addColumn('cart_items', column);
      }
    };

    await ensureColumn(
      new TableColumn({
        name: 'selectedColor',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
    );
    await ensureColumn(
      new TableColumn({
        name: 'selectedSize',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
    );
    await ensureColumn(
      new TableColumn({
        name: 'productName',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
    await ensureColumn(
      new TableColumn({
        name: 'productPrice',
        type: 'decimal',
        precision: 12,
        scale: 2,
        default: 0,
      }),
    );
    await ensureColumn(
      new TableColumn({
        name: 'productImage',
        type: 'varchar',
        length: '500',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('cart_items');
    if (!table) return;

    for (const columnName of [
      'productImage',
      'productPrice',
      'productName',
      'selectedSize',
      'selectedColor',
    ]) {
      if (table.findColumnByName(columnName)) {
        await queryRunner.dropColumn('cart_items', columnName);
      }
    }
  }
}
