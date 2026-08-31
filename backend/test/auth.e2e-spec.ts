import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  const uniqueEmail = `e2e_${Date.now()}@example.com`;

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
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/register - should register a new customer', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'E2E Test User',
        email: uniqueEmail,
        password: 'Password123!',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body.user).toHaveProperty('email', uniqueEmail);
        expect(res.body.user).not.toHaveProperty('password');
      });
  });

  it('POST /auth/login - should authenticate and return JWT', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: uniqueEmail,
        password: 'Password123!',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body.user.email).toBe(uniqueEmail);
      });
  });

  it('POST /auth/login - should reject invalid credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: uniqueEmail,
        password: 'WrongPassword!',
      })
      .expect(401);
  });
});
