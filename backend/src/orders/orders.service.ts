import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { OrderTracking } from '../order-tracking/entities/order-tracking.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { OrderStatus } from './enums/order-status.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(OrderTracking)
    private readonly trackingRepository: Repository<OrderTracking>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  generateOrderNumber(): string {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${dateStr}-${randomSuffix}`;
  }

  async create(user: User, createOrderDto: CreateOrderDto): Promise<Order> {
    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalAmount = 0;
      const orderItemsToSave: OrderItem[] = [];

      for (const itemDto of createOrderDto.items) {
        if (itemDto.quantity <= 0) {
          throw new BadRequestException('Item quantity must be greater than zero');
        }

        const product = await queryRunner.manager.findOne(Product, {
          where: { id: itemDto.productId },
        });

        if (!product) {
          throw new NotFoundException(`Product with ID #${itemDto.productId} not found`);
        }

        if (product.stock < itemDto.quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${itemDto.quantity}`,
          );
        }

        // Deduct inventory
        product.stock -= itemDto.quantity;
        await queryRunner.manager.save(Product, product);

        const itemTotal = Number(product.price) * itemDto.quantity;
        totalAmount += itemTotal;

        const orderItem = queryRunner.manager.create(OrderItem, {
          product,
          productId: product.id,
          quantity: itemDto.quantity,
          price: product.price,
        });

        orderItemsToSave.push(orderItem);
      }

      // Generate unique order tracking number
      let orderNumber = this.generateOrderNumber();
      let exists = await queryRunner.manager.findOne(Order, { where: { orderNumber } });
      while (exists) {
        orderNumber = this.generateOrderNumber();
        exists = await queryRunner.manager.findOne(Order, { where: { orderNumber } });
      }

      const order = queryRunner.manager.create(Order, {
        orderNumber,
        totalAmount: Number(totalAmount.toFixed(2)),
        status: OrderStatus.PENDING,
        user,
        userId: user.id,
        items: orderItemsToSave,
      });

      const savedOrder = await queryRunner.manager.save(Order, order);

      // Create initial order tracking milestone
      const initialTracking = queryRunner.manager.create(OrderTracking, {
        order: savedOrder,
        orderId: savedOrder.id,
        status: OrderStatus.PENDING,
        location: 'Central Fulfillment Facility',
        message: 'Order received and registered. Preparing for fulfillment.',
      });

      await queryRunner.manager.save(OrderTracking, initialTracking);

      await queryRunner.commitTransaction();

      return this.findByIdInternal(savedOrder.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(queryDto: QueryOrderDto, currentUser: User): Promise<PaginatedResult<Order>> {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortOrder = 'DESC',
    } = queryDto;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('order.tracking', 'tracking');

    // Role-based visibility
    if (currentUser.role === UserRole.CUSTOMER) {
      queryBuilder.andWhere('order.userId = :userId', { userId: currentUser.id });
    }

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    if (search && search.trim() !== '') {
      queryBuilder.andWhere(
        '(LOWER(order.orderNumber) LIKE LOWER(:search) OR LOWER(user.name) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search))',
        { search: `%${search.trim()}%` },
      );
    }

    queryBuilder.orderBy('order.createdAt', sortOrder === 'ASC' ? 'ASC' : 'DESC');

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, totalItems] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      data,
      meta: {
        totalItems,
        itemCount: data.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      },
    };
  }

  async findById(id: number, currentUser: User): Promise<Order> {
    const order = await this.findByIdInternal(id);

    if (currentUser.role === UserRole.CUSTOMER && order.userId !== currentUser.id) {
      throw new ForbiddenException('You do not have permission to view this order');
    }

    return order;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { orderNumber },
      relations: ['user', 'items', 'items.product', 'tracking'],
      order: {
        tracking: {
          createdAt: 'DESC',
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with tracking number "${orderNumber}" not found`);
    }

    return order;
  }

  private async findByIdInternal(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'items', 'items.product', 'tracking'],
      order: {
        tracking: {
          createdAt: 'DESC',
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID #${id} not found`);
    }

    return order;
  }

  async updateStatus(id: number, updateDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findByIdInternal(id);

    if (order.status === updateDto.status) {
      return order;
    }

    const previousStatus = order.status;
    order.status = updateDto.status;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // If cancelled from a non-cancelled state, restore product stock
      if (updateDto.status === OrderStatus.CANCELLED && previousStatus !== OrderStatus.CANCELLED) {
        for (const item of order.items) {
          if (item.product) {
            const product = await queryRunner.manager.findOne(Product, {
              where: { id: item.product.id },
            });
            if (product) {
              product.stock += item.quantity;
              await queryRunner.manager.save(Product, product);
            }
          }
        }
      }

      await queryRunner.manager.save(Order, order);

      // Create tracking event
      const tracking = queryRunner.manager.create(OrderTracking, {
        order,
        orderId: order.id,
        status: updateDto.status,
        location: updateDto.location || 'Operations Logistics Hub',
        message: updateDto.message || `Order status updated to ${updateDto.status.replace(/_/g, ' ')}.`,
      });

      await queryRunner.manager.save(OrderTracking, tracking);

      await queryRunner.commitTransaction();
      return this.findByIdInternal(order.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async cancelOrder(id: number, currentUser: User): Promise<Order> {
    const order = await this.findById(id, currentUser);

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    if (
      order.status === OrderStatus.SHIPPED ||
      order.status === OrderStatus.OUT_FOR_DELIVERY ||
      order.status === OrderStatus.DELIVERED
    ) {
      throw new BadRequestException(
        `Cannot cancel order that is already in '${order.status}' status`,
      );
    }

    return this.updateStatus(id, {
      status: OrderStatus.CANCELLED,
      location: 'Customer Service Center',
      message: `Order cancelled by ${currentUser.role === UserRole.ADMIN ? 'Administrator' : 'Customer'}. Stock restored.`,
    });
  }

  async getAdminStats() {
    const totalOrders = await this.orderRepository.count();
    const pendingOrders = await this.orderRepository.count({ where: { status: OrderStatus.PENDING } });
    const processingOrders = await this.orderRepository.count({ where: { status: OrderStatus.PROCESSING } });
    const shippedOrders = await this.orderRepository.count({ where: { status: OrderStatus.SHIPPED } });
    const deliveredOrders = await this.orderRepository.count({ where: { status: OrderStatus.DELIVERED } });
    const cancelledOrders = await this.orderRepository.count({ where: { status: OrderStatus.CANCELLED } });

    const totalRevenueResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'total')
      .where('order.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
      .getRawOne();

    const totalRevenue = parseFloat(totalRevenueResult?.total || '0');

    const totalProducts = await this.productRepository.count();
    const lowStockProducts = await this.productRepository
      .createQueryBuilder('product')
      .where('product.stock <= :threshold', { threshold: 5 })
      .getCount();

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalProducts,
      lowStockProducts,
    };
  }
}
