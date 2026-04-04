import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { AppConfigService } from '../../config/app-config.service';
import { createClient } from 'redis';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Liveness probe — always returns ok if the process is alive' })
  liveness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe — checks DB and Redis connectivity' })
  async readiness() {
    const result: Record<string, string> = {};
    let allHealthy = true;

    // PostgreSQL check
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      result.db = 'connected';
    } catch {
      result.db = 'disconnected';
      allHealthy = false;
    }

    // Redis check
    try {
      const client = createClient({ url: this.config.redisUrl });
      await client.connect();
      await client.ping();
      await client.disconnect();
      result.redis = 'connected';
    } catch {
      // Redis is optional for core functionality — degraded but not down
      result.redis = 'unavailable';
    }

    return {
      status: allHealthy ? 'ready' : 'not_ready',
      ...result,
      timestamp: new Date().toISOString(),
    };
  }
}
