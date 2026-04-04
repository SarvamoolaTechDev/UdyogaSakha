import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OpportunitiesService } from './opportunities.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@udyogasakha/types';
import { CreateOpportunitySchema, OpportunityFiltersSchema } from '@udyogasakha/validators';
import type { CreateOpportunityInput } from '@udyogasakha/validators';
import { ZodPipe } from '../../common/pipes/zod.pipe';

@ApiTags('Opportunities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly service: OpportunitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new opportunity — enters moderation queue' })
  create(
    @CurrentUser('id') userId: string,
    @Body(new ZodPipe(CreateOpportunitySchema)) dto: CreateOpportunityInput,
  ) {
    return this.service.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Browse published opportunities (paginated, filterable)' })
  findAll(@Query(new ZodPipe(OpportunityFiltersSchema)) filters: any) {
    return this.service.findAll(filters);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my own opportunity listings' })
  findMine(@CurrentUser('id') userId: string) {
    return this.service.findByRequester(userId);
  }

  @Get('pending-moderation')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: '[Moderator] Get all opportunities awaiting review' })
  getPendingModeration() {
    return this.service.getPendingModeration();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single opportunity by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a DRAFT opportunity before it enters moderation' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: Partial<CreateOpportunityInput>,
  ) {
    return this.service.update(id, userId, dto);
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Close your own opportunity' })
  close(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: { note?: string },
  ) {
    return this.service.close(id, userId, body.note);
  }

  @Patch(':id/publish')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: '[Moderator] Approve and publish an opportunity' })
  publish(@Param('id') id: string, @CurrentUser('id') moderatorId: string) {
    return this.service.publish(id, moderatorId);
  }

  @Patch(':id/reject')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: '[Moderator] Reject an opportunity listing with reason' })
  reject(
    @Param('id') id: string,
    @CurrentUser('id') moderatorId: string,
    @Body() body: { reason: string },
  ) {
    return this.service.reject(id, moderatorId, body.reason);
  }
}
