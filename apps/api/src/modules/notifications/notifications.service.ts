import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type NotificationChannel = 'email' | 'push' | 'sms' | 'in_app';

export interface NotificationPayload {
  userId: string;
  channel: NotificationChannel;
  subject?: string;
  body: string;
  data?: Record<string, unknown>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  // Gateway is set lazily to avoid circular dependency
  private gateway: any = null;

  constructor(private readonly prisma: PrismaService) {}

  setGateway(gateway: any) {
    this.gateway = gateway;
  }

  async send(payload: NotificationPayload): Promise<void> {
    try {
      switch (payload.channel) {
        case 'in_app':
          await this.storeInApp(payload);
          break;
        case 'email':
          await this.sendEmail(payload);
          break;
        case 'push':
          await this.sendPush(payload);
          break;
        case 'sms':
          await this.sendSms(payload);
          break;
      }
    } catch (err) {
      this.logger.error(`Notification failed [${payload.channel}] userId=${payload.userId}`, err);
    }
  }

  async getUnread(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getAll(userId: string, limit = 50) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async markRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { userId, read: false } });
  }

  // ── Convenience dispatch methods ─────────────────────────────────────────

  async notifyOpportunityPublished(requesterId: string, title: string) {
    return this.send({
      userId: requesterId, channel: 'in_app',
      subject: 'Opportunity published',
      body: `Your opportunity "${title}" is now live.`,
      data: { type: 'opportunity_published' },
    });
  }

  async notifyApplicationReceived(requesterId: string, title: string) {
    return this.send({
      userId: requesterId, channel: 'in_app',
      subject: 'New application',
      body: `You received a new application for "${title}".`,
      data: { type: 'application_received' },
    });
  }

  async notifyTrustLevelElevated(userId: string, level: number) {
    return this.send({
      userId, channel: 'in_app',
      subject: 'Trust level upgraded',
      body: `Congratulations! Your trust level has been upgraded to L${level}.`,
      data: { type: 'trust_level_elevated', level },
    });
  }

  async notifyBadgeRevoked(userId: string, badgeType: string) {
    return this.send({
      userId, channel: 'in_app',
      subject: 'Trust badge revoked',
      body: `Your "${badgeType.replace(/_/g, ' ')}" badge has been revoked.`,
      data: { type: 'badge_revoked', badgeType },
    });
  }

  // ── Channel stubs ─────────────────────────────────────────────────────────

  private async storeInApp(payload: NotificationPayload) {
    const notif = await this.prisma.notification.create({
      data: {
        userId: payload.userId,
        subject: payload.subject,
        body: payload.body,
        data: payload.data as any,
      },
    });
    // Push real-time via WebSocket if a client is connected
    this.gateway?.pushNotification(payload.userId, {
      id: notif.id,
      subject: payload.subject,
      body: payload.body,
      data: payload.data,
    });
  }

  private async sendEmail(payload: NotificationPayload) {
    // TODO Phase 2: wire SES / SMTP
    this.logger.log(`[EMAIL STUB] to=${payload.userId} subject="${payload.subject}"`);
  }

  private async sendPush(payload: NotificationPayload) {
    // TODO Phase 3: wire FCM
    this.logger.log(`[PUSH STUB] to=${payload.userId} title="${payload.subject}"`);
  }

  private async sendSms(payload: NotificationPayload) {
    // TODO Phase 2: wire MSG91 / Twilio
    this.logger.log(`[SMS STUB] to=${payload.userId} body="${payload.body}"`);
  }
}
