import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { QUEUE_NAMES } from '../queue.module';
import { SearchService } from '../../search/search.service';
import { SearchSyncJob } from '../queue.service';

@Processor(QUEUE_NAMES.SEARCH_SYNC)
export class SearchSyncWorker {
  private readonly logger = new Logger(SearchSyncWorker.name);

  constructor(private readonly searchService: SearchService) {}

  @Process('sync')
  async handleSync(job: Job<SearchSyncJob>) {
    const { action, opportunityId } = job.data;
    this.logger.debug(`Search sync: ${action} opportunity ${opportunityId}`);

    try {
      if (action === 'index') {
        await this.searchService.indexOpportunity(opportunityId);
      } else {
        await this.searchService.removeOpportunity(opportunityId);
      }
    } catch (err) {
      this.logger.error(`Search sync job ${job.id} failed`, err);
      throw err;
    }
  }
}
