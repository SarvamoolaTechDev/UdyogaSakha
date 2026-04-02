import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@udyogasakha/types';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: '[Admin] Platform-wide overview stats' })
  getOverview() {
    return this.analyticsService.getOverview();
  }

  @Get('trust-distribution')
  @ApiOperation({ summary: '[Admin] User count by trust level' })
  getTrustDistribution() {
    return this.analyticsService.getTrustDistribution();
  }

  @Get('opportunities-by-module')
  @ApiOperation({ summary: '[Admin] Published opportunity count by module' })
  getByModule() {
    return this.analyticsService.getOpportunitiesByModule();
  }

  @Get('weekly-activity')
  @ApiOperation({ summary: '[Admin] New users and opportunities per week (last 8 weeks)' })
  getWeeklyActivity() {
    return this.analyticsService.getWeeklyActivity();
  }

  @Get('governance-health')
  @ApiOperation({ summary: '[Admin] Governance health indicators' })
  getGovernanceHealth() {
    return this.analyticsService.getGovernanceHealth();
  }
}
