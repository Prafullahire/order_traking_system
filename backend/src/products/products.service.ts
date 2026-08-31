import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async findAll(queryDto: QueryProductDto): Promise<PaginatedResult<Product>> {
    const {
      page = 1,
      limit = 10,
      search,
      inStockOnly,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto;

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (search && search.trim() !== '') {
      queryBuilder.andWhere(
        '(LOWER(product.name) LIKE LOWER(:search) OR LOWER(product.description) LIKE LOWER(:search))',
        { search: `%${search.trim()}%` },
      );
    }

    if (inStockOnly) {
      queryBuilder.andWhere('product.stock > 0');
    }

    const validSortFields = ['id', 'name', 'price', 'stock', 'createdAt', 'updatedAt'];
    const actualSortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const actualSortOrder = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    queryBuilder.orderBy(`product.${actualSortField}`, actualSortOrder);

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

  async findById(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID #${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findById(id);
    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<{ message: string }> {
    const product = await this.findById(id);
    await this.productRepository.remove(product);
    return { message: `Product #${id} removed successfully` };
  }

  async deductStockWithEntityManager(
    manager: EntityManager,
    productId: number,
    quantity: number,
  ): Promise<Product> {
    const product = await manager.findOne(Product, { where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Product with ID #${productId} does not exist`);
    }

    if (product.stock < quantity) {
      throw new BadRequestException(
        `Insufficient stock for product "${product.name}". Available: ${product.stock}, Requested: ${quantity}`,
      );
    }

    product.stock -= quantity;
    return manager.save(Product, product);
  }

  async restoreStockWithEntityManager(
    manager: EntityManager,
    productId: number,
    quantity: number,
  ): Promise<Product | null> {
    const product = await manager.findOne(Product, { where: { id: productId } });
    if (!product) {
      return null;
    }
    product.stock += quantity;
    return manager.save(Product, product);
  }
}
