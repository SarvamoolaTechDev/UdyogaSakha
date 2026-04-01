import { Injectable, Logger } from '@nestjs/common';

export type NotificationChannel = 'email' | 'push' | 'sms' | 'in_app';

export interface NotificationPayload {
  userId: string;
  channel: NotificationChannel;
  subject?: string;      // email subject / push title
  body: string;
  data?: Record<string, unknown>;  // deep-link data for push
}

/**
 * Provider-agnostic notification dispatcher.
 *
 * Each channel method is a stub — wire up your chosen provider
 * (SES, FCM, MSG91, etc.) once the infra decision is made.
 * All calls are fire-and-forget; errors are logged, never thrown.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async send(payload: NotificationPayload): Promise<void> {
    try {
      switch (payload.channel) {
        case 'email':
          await this.sendEmail(payload);
          break;
        case 'push':
          await this.sendPush(payload);
          break;
        case 'sms':
          await this.sendSms(payload);
          break;
        case 'in_app':
          await this.storeInApp(payload);
          break;
      }
    } catch (err) {
      this.logger.error(`Notification failed [${payload.channel}] userId=${payload.userId}`, err);
    }
  }

  // ── Convenience methods ─────────────────────────────────────────────────

  async notifyOpportunityPublished(requesterId: string, opportunityTitle: string) {
    await this.send({
      userId: requesterId,
      channel: 'in_app',
      subject: 'Opportunity published',
      body: `Your opportunity "${opportunityTitle}" has been approved and is now live.`,
    });
  }

  async notifyApplicationReceived(requesterId: string, opportunityTitle: string) {
    await this.send({
      userId: requesterId,
      channel: 'in_app',
      subject: 'New application',
      body: `You received a new application for "${opportunityTitle}".`,
    });
  }

  async notifyTrustLevelElevated(userId: string, newLevel: number) {
    await this.send({
      userId,
      channel: 'in_app',
      subject: 'Trust level upgraded',
      body: `Congratulations! Your trust level has been upgraded to L${newLevel}.`,
    });
  }

  // ── Provider stubs (wire up when infra is decided) ──────────────────────

  private async sendEmail(payload: NotificationPayload) {
    // TODO: plug in SES / SMTP / Resend
    this.logger.log(`[EMAIL STUB] to=${payload.userId} subject="${payload.subject}"`);
  }

  private async sendPush(payload: NotificationPayload) {
    // TODO: plug in FCM
    this.logger.log(`[PUSH STUB] to=${payload.userId} title="${payload.subject}"`);
  }

  private async sendSms(payload: NotificationPayload) {
    // TODO: plug in MSG91 / Twilio
    this.logger.log(`[SMS STUB] to=${payload.userId} body="${payload.body}"`);
  }

  private async storeInApp(payload: NotificationPayload) {
    // TODO: persist to notifications table + emit via WebSocket
    this.logger.log(`[IN_APP] to=${payload.userId} body="${payload.body}"`);
  }
}
