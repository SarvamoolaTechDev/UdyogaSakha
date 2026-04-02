import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { QUEUE_NAMES } from './queue.module';

// ── Job payload types ────────────────────────────────────────────────────────

export interface NotificationJob {
  userId: string;
  channel: 'email' | 'push' | 'sms' | 'in_app';
  subject?: string;
  body: string;
  data?: Record<string, unknown>;
}

export interface SearchSyncJob {
  action: 'index' | 'delete';
  opportunityId: string;
}

export interface VerificationJob {
  userId: string;
  requestId: string;
  documentIds: string[];
}

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue(QUEUE_NAMES.NOTIFICATIONS) private notifQueue: Queue,
    @InjectQueue(QUEUE_NAMES.SEARCH_SYNC)   private searchQueue: Queue,
    @InjectQueue(QUEUE_NAMES.VERIFICATION)  private verifyQueue: Queue,
  ) {}

  // ── Notifications ─────────────────────────────────────────────────────────

  async dispatchNotification(job: NotificationJob, delayMs = 0) {
    return this.notifQueue.add('send', job, { delay: delayMs });
  }

  async notifyOpportunityPublished(requesterId: string, opportunityTitle: string) {
    return this.dispatchNotification({
      userId: requesterId,
      channel: 'in_app',
      subject: 'Opportunity published',
      body: `Your opportunity "${opportunityTitle}" is now live.`,
      data: { type: 'opportunity_published' },
    });
  }

  async notifyApplicationReceived(requesterId: string, opportunityTitle: string) {
    return this.dispatchNotification({
      userId: requesterId,
      channel: 'in_app',
      subject: 'New application',
      body: `You received a new application for "${opportunityTitle}".`,
      data: { type: 'application_received' },
    });
  }

  async notifyApplicationStatusChanged(providerId: string, status: string, opportunityTitle: string) {
    return this.dispatchNotification({
      userId: providerId,
      channel: 'in_app',
      subject: `Application ${status}`,
      body: `Your application for "${opportunityTitle}" has been ${status}.`,
      data: { type: 'application_status_changed', status },
    });
  }

  async notifyTrustLevelElevated(userId: string, newLevel: number) {
    return this.dispatchNotification({
      userId,
      channel: 'in_app',
      subject: 'Trust level upgraded',
      body: `Congratulations! Your trust level has been upgraded to L${newLevel}.`,
      data: { type: 'trust_level_elevated', level: newLevel },
    });
  }

  async notifyBadgeRevoked(userId: string, badgeType: string) {
    return this.dispatchNotification({
      userId,
      channel: 'in_app',
      subject: 'Trust badge revoked',
      body: `Your "${badgeType}" trust badge has been revoked. Please contact support for details.`,
      data: { type: 'badge_revoked', badgeType },
    });
  }

  // ── Search sync ───────────────────────────────────────────────────────────

  async indexOpportunity(opportunityId: string) {
    return this.searchQueue.add('sync', { action: 'index', opportunityId } as SearchSyncJob);
  }

  async removeOpportunityFromIndex(opportunityId: string) {
    return this.searchQueue.add('sync', { action: 'delete', opportunityId } as SearchSyncJob);
  }

  // ── Verification ──────────────────────────────────────────────────────────

  async triggerVerificationReview(userId: string, requestId: string, documentIds: string[]) {
    return this.verifyQueue.add('review', { userId, requestId, documentIds } as VerificationJob, {
      priority: 2,  // higher priority than search sync
    });
  }
}
