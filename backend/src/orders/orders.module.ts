import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { OrderTracking } from '../order-tracking/entities/order-tracking.entity';
import { ProductsModule } from '../products/products.module';
import { OrderTrackingModule } from '../order-tracking/order-tracking.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product, OrderTracking]),
    ProductsModule,
    forwardRef(() => OrderTrackingModule),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService, TypeOrmModule],
})
export class OrdersModule {}
