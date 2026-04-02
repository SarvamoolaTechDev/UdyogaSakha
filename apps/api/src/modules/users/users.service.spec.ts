import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createMockPrisma, mockUser } from '../../test/test-utils';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    prisma = createMockPrisma();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const user = mockUser();
      prisma.user.findUnique.mockResolvedValue(user);
      const result = await service.findById('user-test-id');
      expect(result.id).toBe('user-test-id');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should throw ConflictException if email already taken', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser());
      await expect(
        service.create({ email: 'taken@test.com', password: 'Test@123', fullName: 'Test', participantType: 'INDIVIDUAL' as any, passwordHash: 'hash' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create and return new user', async () => {
      const newUser = mockUser();
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(newUser);
      const result = await service.create({ email: 'new@test.com', password: 'Test@123', fullName: 'New', participantType: 'INDIVIDUAL' as any, passwordHash: 'hash' });
      expect(result.email).toBe(newUser.email);
    });
  });

  describe('sanitize', () => {
    it('should strip passwordHash from user object', () => {
      const user = mockUser();
      const sanitized = service.sanitize(user);
      expect(sanitized).not.toHaveProperty('passwordHash');
      expect(sanitized).toHaveProperty('email');
    });
  });
});
