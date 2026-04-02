import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { AccountStatus, TrustLevel, UserRole } from '@udyogasakha/types';
import type { RegisterInput } from '@udyogasakha/validators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: RegisterInput & { passwordHash: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already registered');

    return this.prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        passwordHash: data.passwordHash,
        roles: [UserRole.PARTICIPANT],
        status: AccountStatus.PENDING_VERIFICATION,
        profile: {
          create: {
            fullName: data.fullName,
            participantType: data.participantType,
            organizationName: data.organizationName,
            showContactAfterMatch: false,
          },
        },
        trustRecord: {
          create: {
            currentLevel: TrustLevel.L0_REGISTERED,
            reputationScore: 0,
            completedEngagements: 0,
          },
        },
      },
      include: { profile: true, trustRecord: true },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { profile: true, trustRecord: true },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true, trustRecord: true, badges: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async search(query: string, limit = 50) {
    return this.prisma.user.findMany({
      where: query
        ? {
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              { phone: { contains: query } },
              { profile: { fullName: { contains: query, mode: 'insensitive' } } },
            ],
          }
        : {},
      include: { profile: true, trustRecord: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async updateProfile(userId: string, data: Record<string, unknown>) {
    await this.findById(userId);
    return this.prisma.userProfile.update({ where: { userId }, data });
  }

  async updateStatus(userId: string, status: AccountStatus) {
    return this.prisma.user.update({ where: { id: userId }, data: { status } });
  }

  async updateRoles(userId: string, roles: UserRole[]) {
    return this.prisma.user.update({ where: { id: userId }, data: { roles } });
  }

  sanitize(user: any) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
