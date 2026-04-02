import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { NotificationWorker } from './workers/notification.worker';
import { SearchSyncWorker } from './workers/search-sync.worker';
import { VerificationWorker } from './workers/verification.worker';
import { SearchModule } from '../search/search.module';
import { NotificationsModule } from '../notifications/notifications.module';

export const QUEUE_NAMES = {
  NOTIFICATIONS:    'notifications',
  SEARCH_SYNC:      'search-sync',
  VERIFICATION:     'verification',
} as const;

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: new URL(config.get('REDIS_URL', 'redis://localhost:6379')).hostname,
          port: parseInt(new URL(config.get('REDIS_URL', 'redis://localhost:6379')).port || '6379'),
        },
        defaultJobOptions: {
          removeOnComplete: 100,  // keep last 100 completed jobs
          removeOnFail: 500,      // keep last 500 failed jobs
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        },
      }),
    }),
    BullModule.registerQueue(
      { name: QUEUE_NAMES.NOTIFICATIONS },
      { name: QUEUE_NAMES.SEARCH_SYNC },
      { name: QUEUE_NAMES.VERIFICATION },
    ),
    SearchModule,
    NotificationsModule,
  ],
  providers: [QueueService, NotificationWorker, SearchSyncWorker, VerificationWorker],
  exports: [QueueService, BullModule],
})
export class QueueModule {}
