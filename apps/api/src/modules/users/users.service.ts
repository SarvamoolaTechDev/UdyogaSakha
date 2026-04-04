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

  /**
   * DPDP right to erasure — permanently deletes the account.
   * Soft-blocks if user has active engagements (must close first).
   * Audit logs are retained per legal retention policy (cascade delete excludes audit_log).
   */
  async deleteAccount(userId: string) {
    const user = await this.findById(userId);

    // Check for active engagements
    const activeEngagements = await this.prisma.engagement.count({
      where: {
        OR: [{ requesterId: userId }, { providerId: userId }],
        status: { in: ['INITIATED', 'IN_PROGRESS'] },
      },
    });

    if (activeEngagements > 0) {
      throw new Error(
        `Cannot delete account with ${activeEngagements} active engagement(s). Please close all engagements first.`,
      );
    }

    // Prisma cascade handles: profile, trustRecord, badges, documents, applications, opportunities
    // audit_log entries are RETAINED (legal requirement — actorId FK is set to restrict delete)
    await this.prisma.user.delete({ where: { id: userId } });
  }
}
