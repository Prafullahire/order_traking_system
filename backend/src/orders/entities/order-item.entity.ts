import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  @ApiProperty({ example: 1, description: 'Unique order item identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 2, description: 'Purchased quantity' })
  @Column({ type: 'int' })
  quantity: number;

  @ApiProperty({ example: 199.99, description: 'Unit price at time of purchase' })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  price: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({ nullable: true })
  orderId: number;

  @ApiProperty({ type: () => Product, description: 'Product associated with order item' })
  @ManyToOne(() => Product, (product) => product.orderItems, { eager: true, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ nullable: true })
  productId: number;
}
