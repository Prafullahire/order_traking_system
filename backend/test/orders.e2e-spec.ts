import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Orders & Tracking (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let customerToken: string;
  let testProductId: number;
  let createdOrderId: number;
  let createdOrderNumber: string;

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

    // Login Admin
    const adminRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'Admin@123' });
    adminToken = adminRes.body.accessToken;

    // Login Customer
    const custRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'customer@example.com', password: 'Customer@123' });
    customerToken = custRes.body.accessToken;

    // Create a product for order testing
    const prodRes = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Order Test Item',
        description: 'Test Description',
        price: 50.0,
        stock: 5,
      });
    testProductId = prodRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /orders - should reject when ordering more than available stock', () => {
    return request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ productId: testProductId, quantity: 10 }], // only 5 in stock
      })
      .expect(400);
  });

  it('POST /orders - should create order, deduct stock, and generate orderNumber', () => {
    return request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ productId: testProductId, quantity: 2 }],
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('orderNumber');
        expect(res.body.status).toBe('PENDING');
        expect(res.body.totalAmount).toBe(100.0);
        createdOrderId = res.body.id;
        createdOrderNumber = res.body.orderNumber;
      });
  });

  it('GET /orders/:id - customer should retrieve their own order with tracking timeline', () => {
    return request(app.getHttpServer())
      .get(`/orders/${createdOrderId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(createdOrderId);
        expect(Array.isArray(res.body.tracking)).toBe(true);
        expect(res.body.tracking.length).toBeGreaterThanOrEqual(1);
      });
  });

  it('PATCH /orders/:id/status - admin should update status and create tracking checkpoint', () => {
    return request(app.getHttpServer())
      .patch(`/orders/${createdOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'SHIPPED',
        location: 'Airport Cargo Terminal',
        message: 'Flight departed to regional distribution facility',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('SHIPPED');
      });
  });

  it('GET /orders/track/number/:orderNumber - public lookup for tracking', () => {
    return request(app.getHttpServer())
      .get(`/orders/track/number/${createdOrderNumber}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.orderNumber).toBe(createdOrderNumber);
        expect(res.body.status).toBe('SHIPPED');
      });
  });
});
