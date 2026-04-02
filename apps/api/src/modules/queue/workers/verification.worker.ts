import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { QUEUE_NAMES } from '../queue.module';
import { NotificationsService } from '../../notifications/notifications.service';
import { VerificationJob } from '../queue.service';

@Processor(QUEUE_NAMES.VERIFICATION)
export class VerificationWorker {
  private readonly logger = new Logger(VerificationWorker.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @Process('review')
  async handleReview(job: Job<VerificationJob>) {
    const { userId, requestId } = job.data;
    this.logger.log(`Verification request ${requestId} queued for user ${userId}`);

    // TODO: when we have a way to look up moderators, send them an in-app alert
    // For now, log for the moderation dashboard to pick up via polling
    this.logger.log(`Moderation action required: review verification request ${requestId}`);
  }
}
