import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Overview stats for the admin dashboard */
  async getOverview() {
    const [
      totalUsers,
      activeUsers,
      pendingVerifications,
      totalOpportunities,
      publishedOpportunities,
      pendingModeration,
      totalEngagements,
      completedEngagements,
      totalApplications,
      openReports,
    ] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.verificationRequest.count({ where: { status: 'pending' } }),
      this.prisma.opportunity.count(),
      this.prisma.opportunity.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.opportunity.count({ where: { status: 'MODERATION' } }),
      this.prisma.engagement.count(),
      this.prisma.engagement.count({ where: { status: 'COMPLETED' } }),
      this.prisma.application.count(),
      this.prisma.report.count({ where: { status: 'pending' } }),
    ]);

    return {
      users: { total: totalUsers, active: activeUsers, pendingVerification: pendingVerifications },
      opportunities: { total: totalOpportunities, published: publishedOpportunities, pendingModeration },
      engagements: { total: totalEngagements, completed: completedEngagements },
      applications: { total: totalApplications },
      moderation: { openReports },
    };
  }

  /** Trust level distribution */
  async getTrustDistribution() {
    const records = await this.prisma.trustRecord.groupBy({
      by: ['currentLevel'],
      _count: { _all: true },
      orderBy: { currentLevel: 'asc' },
    });
    return records.map((r) => ({ level: r.currentLevel, count: r._count._all }));
  }

  /** Opportunity counts by module type */
  async getOpportunitiesByModule() {
    const results = await this.prisma.opportunity.groupBy({
      by: ['moduleType'],
      _count: { _all: true },
      where: { status: 'PUBLISHED' },
    });
    return results.map((r) => ({ moduleType: r.moduleType, count: r._count._all }));
  }

  /** Weekly activity — new users and opportunities published over last 8 weeks */
  async getWeeklyActivity() {
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

    const [newUsers, newOpportunities] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: { createdAt: { gte: eightWeeksAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.opportunity.findMany({
        where: { publishedAt: { gte: eightWeeksAgo }, status: 'PUBLISHED' },
        select: { publishedAt: true },
        orderBy: { publishedAt: 'asc' },
      }),
    ]);

    // Bucket into ISO week strings
    const bucket = (date: Date) => {
      const d = new Date(date);
      d.setDate(d.getDate() - d.getDay()); // start of week
      return d.toISOString().slice(0, 10);
    };

    const usersByWeek: Record<string, number> = {};
    newUsers.forEach(({ createdAt }) => {
      const w = bucket(createdAt);
      usersByWeek[w] = (usersByWeek[w] ?? 0) + 1;
    });

    const oppsByWeek: Record<string, number> = {};
    newOpportunities.forEach(({ publishedAt }) => {
      if (!publishedAt) return;
      const w = bucket(publishedAt);
      oppsByWeek[w] = (oppsByWeek[w] ?? 0) + 1;
    });

    const weeks = [...new Set([...Object.keys(usersByWeek), ...Object.keys(oppsByWeek)])].sort();
    return weeks.map((week) => ({
      week,
      newUsers: usersByWeek[week] ?? 0,
      newOpportunities: oppsByWeek[week] ?? 0,
    }));
  }

  /** Governance health indicators */
  async getGovernanceHealth() {
    const [activeMembers, pendingReports, recentEnforcements, conflictDeclarations] =
      await this.prisma.$transaction([
        this.prisma.governanceMember.count({ where: { active: true } }),
        this.prisma.report.count({ where: { status: 'pending' } }),
        this.prisma.enforcementAction.count({
          where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        }),
        this.prisma.conflictDeclaration.count(),
      ]);

    return { activeMembers, pendingReports, recentEnforcements, conflictDeclarations };
  }
}
