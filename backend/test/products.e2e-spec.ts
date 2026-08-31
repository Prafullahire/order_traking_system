import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Products (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let customerToken: string;
  let createdProductId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();

    // Login as seeded Admin
    const adminRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'Admin@123' });
    adminToken = adminRes.body.accessToken;

    // Login as seeded Customer
    const custRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'customer@example.com', password: 'Customer@123' });
    customerToken = custRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /products - should return list of products publicly', () => {
    return request(app.getHttpServer())
      .get('/products')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body).toHaveProperty('meta');
      });
  });

  it('POST /products - should forbid customer from creating product', () => {
    return request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        name: 'Forbidden Product',
        price: 99.99,
        stock: 10,
      })
      .expect(403);
  });

  it('POST /products - should allow admin to create product', () => {
    return request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'E2E Test Mechanical Keyboard',
        description: 'RGB Backlit switches',
        price: 129.99,
        stock: 50,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe('E2E Test Mechanical Keyboard');
        createdProductId = res.body.id;
      });
  });

  it('PATCH /products/:id - should allow admin to update stock', () => {
    return request(app.getHttpServer())
      .patch(`/products/${createdProductId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ stock: 45 })
      .expect(200)
      .expect((res) => {
        expect(res.body.stock).toBe(45);
      });
  });
});
