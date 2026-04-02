import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config.service';
import { PrismaService } from '../../prisma/prisma.service';

interface OpportunityDocument {
  id: string;
  title: string;
  description: string;
  moduleType: string;
  trustLevelRequired: number;
  requesterId: string;
  requesterName: string;
  location?: string;
  publishedAt: number;  // Unix timestamp — Meilisearch sorts numerics efficiently
}

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private client: any = null;  // MeiliSearch client — lazy-loaded
  private readonly INDEX_NAME = 'opportunities';

  constructor(
    private readonly config: AppConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    await this.initClient();
  }

  private async initClient() {
    try {
      // Dynamic import — keeps Meilisearch optional until Phase 2
      const { MeiliSearch } = await import('meilisearch');
      this.client = new MeiliSearch({
        host: this.config.meilisearchHost,
        apiKey: this.config.meilisearchApiKey,
      });

      // Ensure index exists with correct settings
      await this.client.index(this.INDEX_NAME).getSettings().catch(async () => {
        await this.client.createIndex(this.INDEX_NAME, { primaryKey: 'id' });
      });

      await this.client.index(this.INDEX_NAME).updateSettings({
        searchableAttributes: ['title', 'description', 'requesterName'],
        filterableAttributes: ['moduleType', 'trustLevelRequired', 'requesterId'],
        sortableAttributes: ['publishedAt', 'trustLevelRequired'],
        displayedAttributes: ['id', 'title', 'moduleType', 'trustLevelRequired', 'publishedAt', 'requesterName'],
      });

      this.logger.log('Meilisearch connected and index configured');
    } catch (err) {
      // Meilisearch is non-critical — fall back to Postgres full-text search gracefully
      this.logger.warn('Meilisearch unavailable — falling back to Postgres search');
      this.client = null;
    }
  }

  async indexOpportunity(opportunityId: string): Promise<void> {
    if (!this.client) return;

    const opp = await this.prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: { requester: { include: { profile: true } } },
    });
    if (!opp || !opp.publishedAt) return;

    const trustLevelOrder: Record<string, number> = {
      L0_REGISTERED: 0, L1_DOCUMENT_VERIFIED: 1,
      L2_FOUNDATION_SCREENED: 2, L3_DOMAIN_EXPERT_CERTIFIED: 3, L4_COMMUNITY_ENDORSED: 4,
    };

    const doc: OpportunityDocument = {
      id: opp.id,
      title: opp.title,
      description: opp.description,
      moduleType: opp.moduleType,
      trustLevelRequired: trustLevelOrder[opp.trustLevelRequired as string] ?? 0,
      requesterId: opp.requesterId,
      requesterName: opp.requester?.profile?.fullName ?? '',
      location: (opp.details as any)?.location ?? undefined,
      publishedAt: Math.floor(opp.publishedAt.getTime() / 1000),
    };

    await this.client.index(this.INDEX_NAME).addDocuments([doc]);
  }

  async removeOpportunity(opportunityId: string): Promise<void> {
    if (!this.client) return;
    await this.client.index(this.INDEX_NAME).deleteDocument(opportunityId);
  }

  async search(query: string, filters?: {
    moduleType?: string;
    trustLevelRequired?: number;
    page?: number;
    limit?: number;
  }) {
    if (!this.client) {
      return this.fallbackSearch(query, filters);
    }

    const page  = filters?.page  ?? 1;
    const limit = filters?.limit ?? 20;

    const filterParts: string[] = [];
    if (filters?.moduleType) filterParts.push(`moduleType = "${filters.moduleType}"`);
    if (filters?.trustLevelRequired !== undefined) {
      filterParts.push(`trustLevelRequired >= ${filters.trustLevelRequired}`);
    }

    const result = await this.client.index(this.INDEX_NAME).search(query, {
      filter: filterParts.join(' AND ') || undefined,
      offset: (page - 1) * limit,
      limit,
      sort: ['publishedAt:desc'],
    });

    return {
      hits: result.hits,
      total: result.estimatedTotalHits,
      page,
      limit,
      totalPages: Math.ceil((result.estimatedTotalHits ?? 0) / limit),
      source: 'meilisearch' as const,
    };
  }

  /** Postgres full-text fallback when Meilisearch is unavailable */
  private async fallbackSearch(query: string, filters?: {
    moduleType?: string;
    trustLevelRequired?: number;
    page?: number;
    limit?: number;
  }) {
    const page  = filters?.page  ?? 1;
    const limit = filters?.limit ?? 20;

    const where: any = { status: 'PUBLISHED' };
    if (filters?.moduleType) where.moduleType = filters.moduleType;
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.opportunity.findMany({
        where, skip: (page - 1) * limit, take: limit, orderBy: { publishedAt: 'desc' },
      }),
      this.prisma.opportunity.count({ where }),
    ]);

    return { hits: data, total, page, limit, totalPages: Math.ceil(total / limit), source: 'postgres' as const };
  }
}
