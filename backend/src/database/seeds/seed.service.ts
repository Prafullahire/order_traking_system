import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { Order } from '../../orders/entities/order.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { OrderTracking } from '../../order-tracking/entities/order-tracking.entity';
import { UserRole } from '../../users/enums/user-role.enum';
import { OrderStatus } from '../../orders/enums/order-status.enum';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderTracking)
    private readonly trackingRepository: Repository<OrderTracking>,
  ) {}

  async onApplicationBootstrap() {
    await this.seed();
  }

  async seed() {
    this.logger.log('Checking database seed status...');

    // 1. Seed Users
    const adminCount = await this.userRepository.count({
      where: { email: 'admin@example.com' },
    });

    let adminUser: User;
    if (adminCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123', salt);

      adminUser = this.userRepository.create({
        name: 'System Administrator',
        email: 'admin@example.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
      });
      adminUser = await this.userRepository.save(adminUser);
      this.logger.log('Seeded Admin user: admin@example.com / Admin@123');
    } else {
      adminUser = await this.userRepository.findOne({
        where: { email: 'admin@example.com' },
      });
    }

    const customerCount = await this.userRepository.count({
      where: { email: 'customer@example.com' },
    });

    let customerUser: User;
    if (customerCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Customer@123', salt);

      customerUser = this.userRepository.create({
        name: 'Alex Johnson',
        email: 'customer@example.com',
        password: hashedPassword,
        role: UserRole.CUSTOMER,
      });
      customerUser = await this.userRepository.save(customerUser);
      this.logger.log('Seeded Customer user: customer@example.com / Customer@123');
    } else {
      customerUser = await this.userRepository.findOne({
        where: { email: 'customer@example.com' },
      });
    }

    // 2. Seed Products
    const productCount = await this.productRepository.count();
    let sampleProducts: Product[] = [];

    if (productCount === 0) {
      const productsData = [
        {
          name: 'Pro ANC Wireless Headphones',
          description: 'Premium noise-canceling over-ear headphones with 40mm drivers and 30-hour battery life.',
          price: 299.99,
          stock: 45,
        },
        {
          name: 'UltraWide Curved Gaming Monitor 34"',
          description: 'WQHD 3440x1440 resolution, 165Hz refresh rate, 1ms response time, HDR400 with vibrant colors.',
          price: 649.50,
          stock: 18,
        },
        {
          name: 'Mechanical RGB Tenkeyless Keyboard',
          description: 'Hot-swappable tactile switches, per-key RGB lighting, solid aluminum chassis and PBT keycaps.',
          price: 139.99,
          stock: 60,
        },
        {
          name: 'Ergonomic Wireless Precision Mouse',
          description: '8000 DPI sensor, quiet click switches, customizable gesture buttons and cross-computer control.',
          price: 99.00,
          stock: 75,
        },
        {
          name: 'Studio Quality USB-C Condenser Mic',
          description: 'Cardioid pattern recording, built-in pop filter, zero-latency headphone monitoring.',
          price: 149.95,
          stock: 25,
        },
        {
          name: '4K Pro Streaming Webcam with Ring Light',
          description: 'Ultra HD 4K 60fps video capture, AI autofocus, dual stereo mics and privacy shutter.',
          price: 179.00,
          stock: 32,
        },
        {
          name: 'Smart Fitness & Health Tracker Watch',
          description: 'AMOLED display, 24/7 heart rate & SpO2 tracking, built-in GPS and 14-day battery reserve.',
          price: 219.99,
          stock: 40,
        },
        {
          name: 'Thunderbolt 4 Dual 4K Docking Station',
          description: '96W power delivery, dual HDMI/DisplayPort, gigabit ethernet, SD card reader and 6 USB ports.',
          price: 249.00,
          stock: 15,
        },
      ];

      sampleProducts = await this.productRepository.save(
        productsData.map((p) => this.productRepository.create(p)),
      );
      this.logger.log(`Seeded ${sampleProducts.length} initial products`);
    } else {
      sampleProducts = await this.productRepository.find({ take: 5 });
    }

    // 3. Seed Sample Orders and Tracking if none exist
    const orderCount = await this.orderRepository.count();
    if (orderCount === 0 && customerUser && sampleProducts.length >= 2) {
      // Order 1: Shipped Order
      const item1 = this.orderItemRepository.create({
        product: sampleProducts[0],
        productId: sampleProducts[0].id,
        quantity: 1,
        price: sampleProducts[0].price,
      });
      const item2 = this.orderItemRepository.create({
        product: sampleProducts[2],
        productId: sampleProducts[2].id,
        quantity: 2,
        price: sampleProducts[2].price,
      });

      const total1 = Number(sampleProducts[0].price) * 1 + Number(sampleProducts[2].price) * 2;

      const order1 = this.orderRepository.create({
        orderNumber: 'ORD-20260827-1001',
        totalAmount: total1,
        status: OrderStatus.SHIPPED,
        user: customerUser,
        userId: customerUser.id,
        items: [item1, item2],
      });

      const savedOrder1 = await this.orderRepository.save(order1);

      const track1_1 = this.trackingRepository.create({
        order: savedOrder1,
        orderId: savedOrder1.id,
        status: OrderStatus.PENDING,
        location: 'Warehouse Facility, Chicago, IL',
        message: 'Order received and payment verified successfully.',
        createdAt: new Date(Date.now() - 3600 * 1000 * 48),
      });

      const track1_2 = this.trackingRepository.create({
        order: savedOrder1,
        orderId: savedOrder1.id,
        status: OrderStatus.CONFIRMED,
        location: 'Warehouse Facility, Chicago, IL',
        message: 'Order confirmed and allocated for packaging.',
        createdAt: new Date(Date.now() - 3600 * 1000 * 36),
      });

      const track1_3 = this.trackingRepository.create({
        order: savedOrder1,
        orderId: savedOrder1.id,
        status: OrderStatus.PROCESSING,
        location: 'Packaging Station 4, Chicago, IL',
        message: 'Items picked and packaged into carrier container.',
        createdAt: new Date(Date.now() - 3600 * 1000 * 24),
      });

      const track1_4 = this.trackingRepository.create({
        order: savedOrder1,
        orderId: savedOrder1.id,
        status: OrderStatus.SHIPPED,
        location: 'Regional Sorting Hub, Indianapolis, IN',
        message: 'Package departed carrier sorting terminal and is en route.',
        createdAt: new Date(Date.now() - 3600 * 1000 * 8),
      });

      await this.trackingRepository.save([track1_1, track1_2, track1_3, track1_4]);

      // Order 2: Delivered Order
      const item3 = this.orderItemRepository.create({
        product: sampleProducts[3],
        productId: sampleProducts[3].id,
        quantity: 1,
        price: sampleProducts[3].price,
      });

      const order2 = this.orderRepository.create({
        orderNumber: 'ORD-20260826-2045',
        totalAmount: Number(sampleProducts[3].price),
        status: OrderStatus.DELIVERED,
        user: customerUser,
        userId: customerUser.id,
        items: [item3],
      });

      const savedOrder2 = await this.orderRepository.save(order2);

      const track2_1 = this.trackingRepository.create({
        order: savedOrder2,
        orderId: savedOrder2.id,
        status: OrderStatus.DELIVERED,
        location: 'Front Porch / Customer Address, New York, NY',
        message: 'Package delivered safely to recipient.',
        createdAt: new Date(Date.now() - 3600 * 1000 * 2),
      });
      await this.trackingRepository.save(track2_1);

      this.logger.log('Seeded sample demo orders and tracking checkpoints.');
    }
  }
}
