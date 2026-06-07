import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfilePaymentAndOrderHistoryControls1720000008000
  implements MigrationInterface
{
  name = 'AddProfilePaymentAndOrderHistoryControls1720000008000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn('users', 'defaultPaymentMethod'))) {
      await queryRunner.query(`
        ALTER TABLE users
        ADD COLUMN defaultPaymentMethod varchar(255) NOT NULL DEFAULT 'cod'
      `);
    }

    if (!(await queryRunner.hasColumn('orders', 'cancelReason'))) {
      await queryRunner.query('ALTER TABLE orders ADD COLUMN cancelReason text NULL');
    }
    if (!(await queryRunner.hasColumn('orders', 'hiddenFromCustomer'))) {
      await queryRunner.query(
        'ALTER TABLE orders ADD COLUMN hiddenFromCustomer tinyint NOT NULL DEFAULT 0',
      );
    }
    if (!(await queryRunner.hasColumn('orders', 'customerDeletedAt'))) {
      await queryRunner.query('ALTER TABLE orders ADD COLUMN customerDeletedAt datetime NULL');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn('orders', 'customerDeletedAt')) {
      await queryRunner.query('ALTER TABLE orders DROP COLUMN customerDeletedAt');
    }
    if (await queryRunner.hasColumn('orders', 'hiddenFromCustomer')) {
      await queryRunner.query('ALTER TABLE orders DROP COLUMN hiddenFromCustomer');
    }
    if (await queryRunner.hasColumn('orders', 'cancelReason')) {
      await queryRunner.query('ALTER TABLE orders DROP COLUMN cancelReason');
    }
    if (await queryRunner.hasColumn('users', 'defaultPaymentMethod')) {
      await queryRunner.query('ALTER TABLE users DROP COLUMN defaultPaymentMethod');
    }
  }
}
