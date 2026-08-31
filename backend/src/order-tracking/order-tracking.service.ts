import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderTracking } from './entities/order-tracking.entity';
import { Order } from '../orders/entities/order.entity';
import { CreateOrderTrackingDto } from './dto/create-order-tracking.dto';

@Injectable()
export class OrderTrackingService {
  constructor(
    @InjectRepository(OrderTracking)
    private readonly trackingRepository: Repository<OrderTracking>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async create(orderId: number, dto: CreateOrderTrackingDto): Promise<OrderTracking> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['tracking'],
    });

    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }

    const tracking = this.trackingRepository.create({
      order,
      orderId: order.id,
      status: dto.status,
      location: dto.location,
      message: dto.message,
    });

    const saved = await this.trackingRepository.save(tracking);

    if (dto.updateOrderStatus !== false && order.status !== dto.status) {
      order.status = dto.status;
      await this.orderRepository.save(order);
    }

    return saved;
  }

  async findByOrderId(orderId: number): Promise<OrderTracking[]> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }

    return this.trackingRepository.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
  }
}
