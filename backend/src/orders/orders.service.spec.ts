import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { OrderTracking } from '../order-tracking/entities/order-tracking.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { OrderStatus } from './enums/order-status.enum';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepository: any;
  let productRepository: any;
  let dataSource: any;

  const mockUser: User = {
    id: 1,
    name: 'Customer Test',
    email: 'cust@example.com',
    password: 'hash',
    role: UserRole.CUSTOMER,
    orders: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProduct: Product = {
    id: 1,
    name: 'Gaming Headset',
    description: 'Surround sound headset',
    price: 100.0,
    stock: 10,
    orderItems: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrder: Order = {
    id: 1,
    orderNumber: 'ORD-20260827-1234',
    totalAmount: 200.0,
    status: OrderStatus.PENDING,
    user: mockUser,
    userId: 1,
    items: [],
    tracking: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let mockQueryRunner: any;

  beforeEach(async () => {
    mockQueryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      manager: {
        findOne: jest.fn(),
        create: jest.fn().mockImplementation((entityClass, data) => ({ ...data })),
        save: jest.fn().mockImplementation((entityClass, data) => {
          return Promise.resolve({ id: 1, ...data });
        }),
      },
    };

    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    orderRepository = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
      count: jest.fn(),
    };

    productRepository = {
      findOne: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: orderRepository },
        { provide: getRepositoryToken(OrderItem), useValue: {} },
        { provide: getRepositoryToken(Product), useValue: productRepository },
        { provide: getRepositoryToken(OrderTracking), useValue: {} },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create order', () => {
    it('should successfully create an order and deduct stock', async () => {
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockProduct) // find product
        .mockResolvedValueOnce(null); // find duplicate orderNumber check

      orderRepository.findOne.mockResolvedValue({
        ...mockOrder,
        items: [{ id: 1, quantity: 2, price: 100, product: mockProduct }],
      });

      const result = await service.create(mockUser, {
        items: [{ productId: 1, quantity: 2 }],
      });

      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException when product stock is insufficient', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValueOnce({
        ...mockProduct,
        stock: 1, // Only 1 in stock, requested 5
      });

      await expect(
        service.create(mockUser, {
          items: [{ productId: 1, quantity: 5 }],
        }),
      ).rejects.toThrow(BadRequestException);

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException when product ID is invalid', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValueOnce(null);

      await expect(
        service.create(mockUser, {
          items: [{ productId: 999, quantity: 1 }],
        }),
      ).rejects.toThrow(NotFoundException);

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('cancelOrder', () => {
    it('should cancel PENDING order and update status', async () => {
      orderRepository.findOne.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.PENDING,
        items: [{ quantity: 2, product: { id: 1, stock: 8 } }],
      });

      mockQueryRunner.manager.findOne.mockResolvedValue({ id: 1, stock: 8 });

      const cancelled = await service.cancelOrder(1, mockUser);
      expect(cancelled).toBeDefined();
    });

    it('should throw BadRequestException if order is already DELIVERED', async () => {
      orderRepository.findOne.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.DELIVERED,
      });

      await expect(service.cancelOrder(1, mockUser)).rejects.toThrow(BadRequestException);
    });
  });
});
