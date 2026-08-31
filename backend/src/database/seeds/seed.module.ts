import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { Order } from '../../orders/entities/order.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { OrderTracking } from '../../order-tracking/entities/order-tracking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Product, Order, OrderItem, OrderTracking]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
