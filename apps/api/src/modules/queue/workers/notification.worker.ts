import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { QUEUE_NAMES } from '../queue.module';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationJob } from '../queue.service';

@Processor(QUEUE_NAMES.NOTIFICATIONS)
export class NotificationWorker {
  private readonly logger = new Logger(NotificationWorker.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @Process('send')
  async handleSend(job: Job<NotificationJob>) {
    this.logger.debug(`Processing notification job ${job.id} for user ${job.data.userId}`);
    try {
      await this.notificationsService.send(job.data);
    } catch (err) {
      this.logger.error(`Notification job ${job.id} failed`, err);
      throw err; // re-throw so BullMQ retries
    }
  }
}
