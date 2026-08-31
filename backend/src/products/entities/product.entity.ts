import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { OrderItem } from '../../orders/entities/order-item.entity';

@Entity('products')
export class Product {
  @ApiProperty({ example: 1, description: 'Unique product identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Wireless Noise-Canceling Headphones', description: 'Product name' })
  @Column({ type: 'varchar', length: 200 })
  name: string;

  @ApiProperty({
    example: 'Premium wireless headphones with active noise cancellation and 30-hour battery life.',
    description: 'Product description',
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ example: 199.99, description: 'Product price in USD' })
  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value),
  } })
  price: number;

  @ApiProperty({ example: 50, description: 'Available inventory stock quantity' })
  @Column({ type: 'int', default: 0 })
  stock: number;

  @OneToMany(() => OrderItem, (item) => item.product)
  orderItems: OrderItem[];

  @ApiProperty({ example: '2026-08-27T12:00:00.000Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2026-08-27T12:00:00.000Z' })
  @UpdateDateColumn()
  updatedAt: Date;
}
