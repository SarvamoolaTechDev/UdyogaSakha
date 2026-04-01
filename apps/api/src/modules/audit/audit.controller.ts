import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditEntityType, UserRole } from '@udyogasakha/types';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('entity/:type/:id')
  @ApiOperation({ summary: '[Admin] Get audit log for a specific entity' })
  getEntityLog(
    @Param('type') type: AuditEntityType,
    @Param('id') id: string,
  ) {
    return this.auditService.getLogsForEntity(type, id);
  }

  @Get('actor/:actorId')
  @ApiOperation({ summary: '[Admin] Get audit log for a specific actor' })
  getActorLog(
    @Param('actorId') actorId: string,
    @Query('limit') limit?: number,
  ) {
    return this.auditService.getLogsForActor(actorId, limit);
  }
}
