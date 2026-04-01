import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountStatus, TrustLevel, UserRole } from '@udyogasakha/types';
import { RegisterInput } from '@udyogasakha/validators';

// TODO: Replace stub records with PrismaService queries once DB is wired
// import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  // ── Stub in-memory store (replace with Prisma) ──────────────────────────
  private users: any[] = [];

  async create(data: RegisterInput & { passwordHash: string }) {
    const user = {
      id: crypto.randomUUID(),
      email: data.email,
      phone: data.phone,
      passwordHash: data.passwordHash,
      roles: [UserRole.PARTICIPANT],
      status: AccountStatus.PENDING_VERIFICATION,
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        fullName: data.fullName,
        participantType: data.participantType,
        organizationName: data.organizationName,
        showContactAfterMatch: false,
      },
      trust: {
        currentLevel: TrustLevel.L0_REGISTERED,
        badges: [],
        reputationScore: 0,
        completedEngagements: 0,
      },
    };
    this.users.push(user);
    return user;
  }

  async findByEmail(email: string) {
    return this.users.find((u) => u.email === email) ?? null;
  }

  async findById(id: string) {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, data: Partial<any>) {
    const user = await this.findById(userId);
    Object.assign(user.profile, data);
    user.updatedAt = new Date();
    return user;
  }

  async updateStatus(userId: string, status: AccountStatus) {
    const user = await this.findById(userId);
    user.status = status;
    user.updatedAt = new Date();
    return user;
  }

  /** Strip sensitive fields before sending to client */
  sanitize(user: any) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
