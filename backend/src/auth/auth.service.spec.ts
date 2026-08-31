import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/enums/user-role.enum';
import { User } from '../users/entities/user.entity';

import { generateTestUser } from './test.constants';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;

  const testUser = generateTestUser();
  const mockUser: User = {
    id: 1,
    name: testUser.name,
    email: testUser.email,
    password: 'hashedPassword',
    role: testUser.role,
    orders: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock_jwt_token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully and return token', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser);

      const result = await authService.register({
        name: testUser.name,
        email: testUser.email,
        password: testUser.password,
        role: testUser.role,
      });

      expect(usersService.findByEmail).toHaveBeenCalledWith(testUser.email);
      expect(usersService.create).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken', 'mock_jwt_token');
      expect(result.user.email).toEqual(testUser.email);
    });

    it('should throw ConflictException if email is already taken', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        authService.register({
          name: testUser.name,
          email: testUser.email,
          password: testUser.password,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return auth response when credentials are valid', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);

      const result = await authService.login({
        email: testUser.email,
        password: testUser.password,
      });

      expect(result).toHaveProperty('accessToken', 'mock_jwt_token');
      expect(result.user.id).toBe(1);
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'wrong@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user when password matches', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true as never));

      const user = await authService.validateUser(testUser.email, testUser.password);
      expect(user).toEqual(mockUser);
    });

    it('should return null when password does not match', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false as never));

      const user = await authService.validateUser(testUser.email, 'WrongPass');
      expect(user).toBeNull();
    });
  });
});
