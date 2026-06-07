import { MigrationInterface, QueryRunner } from 'typeorm';

export class AllowGuestOrders1720000006000 implements MigrationInterface {
  name = 'AllowGuestOrders1720000006000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE orders MODIFY userId int NULL');
    await queryRunner.query('ALTER TABLE orders ADD guestEmail varchar(255) NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('UPDATE orders SET userId = 0 WHERE userId IS NULL');
    await queryRunner.query('ALTER TABLE orders MODIFY userId int NOT NULL');
    await queryRunner.query('ALTER TABLE orders DROP COLUMN guestEmail');
  }
}
