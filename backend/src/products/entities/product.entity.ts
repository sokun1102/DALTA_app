import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products') // Đây là tên bảng sẽ được tạo tự động trong MySQL Workbench
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal')
  price: number;
}
