import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ModerationService } from './moderation.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, Roles } from '../../common/decorators/roles.decorator';
import { EnforcementActionType, UserRole } from '@udyogasakha/types';

@ApiTags('Moderation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('moderation')
export class ModerationController {
  constructor(private readonly service: ModerationService) {}

  @Post('reports')
  @ApiOperation({ summary: 'Submit a report against a user, opportunity, or engagement' })
  submitReport(
    @CurrentUser('id') userId: string,
    @Body() body: { subjectType: string; subjectId: string; reason: string; detail?: string },
  ) {
    return this.service.submitReport(userId, body.subjectType, body.subjectId, body.reason, body.detail);
  }

  @Get('reports/pending')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: '[Moderator] View pending reports queue' })
  getPendingReports() {
    return this.service.getPendingReports();
  }

  @Patch('reports/:id/resolve')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: '[Moderator] Resolve a report' })
  resolveReport(
    @Param('id') id: string,
    @CurrentUser('id') moderatorId: string,
    @Body() body: { resolution: string },
  ) {
    return this.service.resolveReport(id, moderatorId, body.resolution);
  }

  @Post('enforce')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: '[Moderator] Apply an enforcement action' })
  enforce(
    @CurrentUser('id') moderatorId: string,
    @Body() body: {
      targetUserId: string;
      action: EnforcementActionType;
      reason: string;
      expiresAt?: string;
    },
  ) {
    return this.service.enforce(
      body.targetUserId,
      body.action,
      body.reason,
      moderatorId,
      body.expiresAt ? new Date(body.expiresAt) : undefined,
    );
  }

  @Get('users/:userId/enforcement-history')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: '[Moderator] Get enforcement history for a user' })
  getEnforcementHistory(@Param('userId') userId: string) {
    return this.service.getEnforcementHistory(userId);
  }
}
