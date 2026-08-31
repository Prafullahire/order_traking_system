import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: any;

  const mockProduct: Product = {
    id: 1,
    name: 'Wireless Mouse',
    description: 'Ergonomic mouse',
    price: 49.99,
    stock: 20,
    orderItems: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockQueryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[mockProduct], 1]),
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((product) => Promise.resolve({ id: 1, ...product })),
      findOne: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create and return a product', async () => {
      const dto = {
        name: 'Wireless Mouse',
        description: 'Ergonomic mouse',
        price: 49.99,
        stock: 20,
      };

      const result = await service.create(dto);
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 1);
    });
  });

  describe('findById', () => {
    it('should return a product when found', async () => {
      repository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findById(1);
      expect(result).toEqual(mockProduct);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when product does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated list of products', async () => {
      const result = await service.findAll({ page: 1, limit: 10, search: 'Mouse' });
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.meta.totalItems).toBe(1);
      expect(result.meta.currentPage).toBe(1);
    });
  });
});
