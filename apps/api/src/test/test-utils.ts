/**
 * Creates a mock PrismaService where every model method is a jest.fn().
 */
export function createMockPrisma() {
  const mockModel = () => ({
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  });

  return {
    user: mockModel(),
    userProfile: mockModel(),
    userDocument: mockModel(),
    trustRecord: mockModel(),
    trustBadge: mockModel(),
    verificationRequest: mockModel(),
    opportunity: mockModel(),
    application: mockModel(),
    engagement: mockModel(),
    engagementFeedback: mockModel(),
    governanceMember: mockModel(),
    conflictDeclaration: mockModel(),
    screeningSession: mockModel(),
    report: mockModel(),
    enforcementAction: mockModel(),
    auditLog: mockModel(),
    notification: mockModel(),
    $transaction: jest.fn((args: unknown[]) => Promise.all(args)),
    $queryRaw: jest.fn(),
    $executeRawUnsafe: jest.fn(),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };
}

export function mockUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-test-id',
    email: 'test@udyogasakha.org',
    phone: null,
    passwordHash: '$2b$12$hashedpassword',
    roles: ['PARTICIPANT'],
    status: 'ACTIVE',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    profile: {
      userId: 'user-test-id',
      fullName: 'Test User',
      participantType: 'INDIVIDUAL',
      showContactAfterMatch: false,
    },
    trustRecord: {
      userId: 'user-test-id',
      currentLevel: 'L0_REGISTERED',
      reputationScore: 0,
      completedEngagements: 0,
    },
    ...overrides,
  };
}

export function mockOpportunity(overrides: Record<string, unknown> = {}) {
  return {
    id: 'opp-test-id',
    requesterId: 'user-test-id',
    moduleType: 'EMPLOYMENT_EXCHANGE',
    title: 'Test Opportunity',
    description: 'A test opportunity description with enough characters',
    trustLevelRequired: 'L1_DOCUMENT_VERIFIED',
    status: 'PUBLISHED',
    isPublic: true,
    details: {},
    publishedAt: new Date('2024-01-01'),
    closesAt: null,
    rejectionReason: null,
    closureNote: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

export function mockEngagement(overrides: Record<string, unknown> = {}) {
  return {
    id: 'eng-test-id',
    opportunityId: 'opp-test-id',
    requesterId: 'requester-id',
    providerId: 'provider-id',
    status: 'INITIATED',
    startedAt: new Date('2024-01-01'),
    closedAt: null,
    closureNote: null,
    completionAcknowledgedAt: null,
    ...overrides,
  };
}

export function mockNotification(overrides: Record<string, unknown> = {}) {
  return {
    id: 'notif-test-id',
    userId: 'user-test-id',
    subject: 'Test notification',
    body: 'Test notification body',
    data: null,
    read: false,
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}
