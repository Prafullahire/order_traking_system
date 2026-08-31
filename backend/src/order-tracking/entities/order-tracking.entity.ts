import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import { Order } from '../../orders/entities/order.entity';

@Entity('order_trackings')
export class OrderTracking {
  @ApiProperty({ example: 1, description: 'Unique tracking event identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.CONFIRMED, description: 'Status milestone at this checkpoint' })
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @ApiProperty({ example: 'Central Logistics Hub, New York, NY', description: 'Checkpoint location' })
  @Column({ type: 'varchar', length: 255 })
  location: string;

  @ApiProperty({ example: 'Package received and verified at departure facility', description: 'Status update notes' })
  @Column({ type: 'text' })
  message: string;

  @ManyToOne(() => Order, (order) => order.tracking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({ nullable: true })
  orderId: number;

  @ApiProperty({ example: '2026-08-27T12:30:00.000Z' })
  @CreateDateColumn()
  createdAt: Date;
}
