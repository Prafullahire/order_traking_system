import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../enums/order-status.enum';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { OrderTracking } from '../../order-tracking/entities/order-tracking.entity';

@Entity('orders')
export class Order {
  @ApiProperty({ example: 1, description: 'Unique order identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'ORD-20260827-8942', description: 'Unique generated order tracking code' })
  @Column({ type: 'varchar', length: 50, unique: true })
  orderNumber: string;

  @ApiProperty({ example: 399.98, description: 'Total purchase amount' })
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  totalAmount: number;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PENDING, description: 'Current order lifecycle status' })
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @ApiProperty({ type: () => User, description: 'Customer who placed the order' })
  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: number;

  @ApiProperty({ type: () => [OrderItem], description: 'List of order items' })
  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items: OrderItem[];

  @ApiProperty({ type: () => [OrderTracking], description: 'Tracking history timeline logs' })
  @OneToMany(() => OrderTracking, (tracking) => tracking.order, { cascade: true })
  tracking: OrderTracking[];

  @ApiProperty({ example: '2026-08-27T12:00:00.000Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2026-08-27T12:00:00.000Z' })
  @UpdateDateColumn()
  updatedAt: Date;
}
