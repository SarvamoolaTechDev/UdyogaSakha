import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TrustService } from './trust.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@udyogasakha/types';

@ApiTags('Trust')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('trust')
export class TrustController {
  constructor(private readonly trustService: TrustService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my trust summary' })
  getMyTrust(@CurrentUser('id') userId: string) {
    return this.trustService.getTrustSummary(userId);
  }

  @Get('verifications/pending')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: '[Moderator] Get pending L1 verification requests' })
  getPendingVerifications() {
    return this.trustService.getPendingVerifications();
  }

  @Get(':userId')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: '[Moderator] Get trust summary for a user' })
  getTrust(@Param('userId') userId: string) {
    return this.trustService.getTrustSummary(userId);
  }

  @Post('request-verification')
  @ApiOperation({ summary: 'Request L1 document verification' })
  requestVerification(
    @CurrentUser('id') userId: string,
    @Body() body: { documentIds: string[] },
  ) {
    return this.trustService.requestDocumentVerification(userId, body.documentIds);
  }

  @Post(':userId/approve-l1')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: '[Moderator] Approve L1 document verification' })
  approveL1(@Param('userId') userId: string, @CurrentUser('id') moderatorId: string) {
    return this.trustService.approveL1(userId, moderatorId);
  }

  @Post('badges/:badgeId/revoke')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: '[Moderator] Revoke a trust badge' })
  revokeBadge(
    @Param('badgeId') badgeId: string,
    @Body() body: { reason: string },
    @CurrentUser('id') moderatorId: string,
  ) {
    return this.trustService.revokeBadge(badgeId, body.reason, moderatorId);
  }
}
