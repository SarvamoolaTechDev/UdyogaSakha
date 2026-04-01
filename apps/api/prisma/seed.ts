import { PrismaClient, UserRole, AccountStatus, ParticipantType, TrustLevel } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding UdyogaSakha database...');

  // ── Admin user ──────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_SEED_EMAIL ?? 'admin@udyogasakha.org';
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? 'ChangeMe@123';

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPassword, 12),
        roles: [UserRole.ADMIN, UserRole.MODERATOR],
        status: AccountStatus.ACTIVE,
        profile: {
          create: {
            fullName: 'Platform Admin',
            participantType: ParticipantType.INDIVIDUAL,
            showContactAfterMatch: false,
          },
        },
        trustRecord: {
          create: {
            currentLevel: TrustLevel.L2_FOUNDATION_SCREENED,
            reputationScore: 0,
            completedEngagements: 0,
          },
        },
      },
    });
    console.log(`  Admin created: ${admin.email}`);
  } else {
    console.log(`  Admin already exists: ${adminEmail}`);
  }

  // ── Sample participant (for dev testing) ────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const testEmail = 'participant@example.com';
    const existing = await prisma.user.findUnique({ where: { email: testEmail } });

    if (!existing) {
      await prisma.user.create({
        data: {
          email: testEmail,
          passwordHash: await bcrypt.hash('Test@1234', 12),
          roles: [UserRole.PARTICIPANT],
          status: AccountStatus.ACTIVE,
          profile: {
            create: {
              fullName: 'Test Participant',
              participantType: ParticipantType.INDIVIDUAL,
              showContactAfterMatch: true,
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
      });
      console.log(`  Test participant created: ${testEmail}`);
    }
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
