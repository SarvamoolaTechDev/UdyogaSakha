import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GovernanceService } from './governance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, Roles } from '../../common/decorators/roles.decorator';
import { CouncilType, UserRole } from '@udyogasakha/types';

@ApiTags('Governance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('governance')
export class GovernanceController {
  constructor(private readonly service: GovernanceService) {}

  @Get('members')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] List active governance members' })
  getMembers(@Query('councilType') councilType?: CouncilType) {
    return this.service.getActiveMembers(councilType);
  }

  @Post('members')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Add a governance council member' })
  addMember(
    @CurrentUser('id') adminId: string,
    @Body() body: { userId: string; councilType: CouncilType; domain: string },
  ) {
    return this.service.addMember(body.userId, body.councilType, body.domain, adminId);
  }

  @Patch('members/:id/deactivate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Deactivate a governance member' })
  deactivate(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.service.deactivateMember(id, adminId);
  }

  @Post('conflicts')
  @Roles(UserRole.ADMIN, UserRole.GOVERNANCE_MEMBER)
  @ApiOperation({ summary: 'Declare a conflict of interest' })
  declareConflict(
    @CurrentUser('id') memberId: string,
    @Body() body: { entityId: string; entityType: string; notes: string },
  ) {
    return this.service.declareConflict(memberId, body.entityId, body.entityType, body.notes);
  }

  @Post('sessions')
  @Roles(UserRole.ADMIN, UserRole.GOVERNANCE_MEMBER)
  @ApiOperation({ summary: 'Schedule a DEP screening session' })
  scheduleSession(
    @CurrentUser('id') panelMemberId: string,
    @Body() body: { candidateId: string; scheduledAt: string; domain: string },
  ) {
    return this.service.scheduleScreeningSession(
      body.candidateId,
      panelMemberId,
      new Date(body.scheduledAt),
      body.domain,
    );
  }

  @Patch('sessions/:id/outcome')
  @Roles(UserRole.ADMIN, UserRole.GOVERNANCE_MEMBER)
  @ApiOperation({ summary: 'Record the outcome of a screening session' })
  recordOutcome(
    @Param('id') id: string,
    @CurrentUser('id') panelMemberId: string,
    @Body() body: { outcome: 'approved' | 'rejected' | 'deferred'; notes: string },
  ) {
    return this.service.recordSessionOutcome(id, panelMemberId, body.outcome, body.notes);
  }

  @Get('members/:memberId/conflicts')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Get conflict declarations for a governance member' })
  getMemberConflicts(@Param('memberId') memberId: string) {
    return this.service.getConflictDeclarations(memberId);
  }

  @Get('sessions')
  @Roles(UserRole.ADMIN, UserRole.GOVERNANCE_MEMBER)
  @ApiOperation({ summary: '[Governance] List all screening sessions' })
  getSessions(@Query('status') status?: string) {
    return this.service.getSessions(status ? { status } : undefined);
  }
}

