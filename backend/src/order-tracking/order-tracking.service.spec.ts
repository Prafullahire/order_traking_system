import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { OrderTrackingService } from './order-tracking.service';
import { OrderTracking } from './entities/order-tracking.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderStatus } from '../orders/enums/order-status.enum';

describe('OrderTrackingService', () => {
  let service: OrderTrackingService;
  let trackingRepository: any;
  let orderRepository: any;

  const mockOrder: Partial<Order> = {
    id: 1,
    orderNumber: 'ORD-20260827-9999',
    status: OrderStatus.PENDING,
    tracking: [],
  };

  const mockTracking: Partial<OrderTracking> = {
    id: 1,
    status: OrderStatus.SHIPPED,
    location: 'Distribution Center',
    message: 'Package on the way',
    orderId: 1,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    trackingRepository = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((track) => Promise.resolve({ id: 1, ...track })),
      find: jest.fn().mockResolvedValue([mockTracking]),
    };

    orderRepository = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((order) => Promise.resolve(order)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderTrackingService,
        {
          provide: getRepositoryToken(OrderTracking),
          useValue: trackingRepository,
        },
        {
          provide: getRepositoryToken(Order),
          useValue: orderRepository,
        },
      ],
    }).compile();

    service = module.get<OrderTrackingService>(OrderTrackingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should add tracking event and update order status', async () => {
      orderRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.create(1, {
        status: OrderStatus.SHIPPED,
        location: 'Distribution Center',
        message: 'Package on the way',
        updateOrderStatus: true,
      });

      expect(trackingRepository.create).toHaveBeenCalled();
      expect(trackingRepository.save).toHaveBeenCalled();
      expect(orderRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 1);
    });

    it('should throw NotFoundException if order does not exist', async () => {
      orderRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create(999, {
          status: OrderStatus.PROCESSING,
          location: 'Hub',
          message: 'Processing',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByOrderId', () => {
    it('should return tracking list for valid order', async () => {
      orderRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.findByOrderId(1);
      expect(result).toHaveLength(1);
      expect(trackingRepository.find).toHaveBeenCalledWith({
        where: { orderId: 1 },
        order: { createdAt: 'DESC' },
      });
    });
  });
});
