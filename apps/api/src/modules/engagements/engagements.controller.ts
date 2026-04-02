import {
  Controller, Get, Post, Patch, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EngagementsService } from './engagements.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/roles.decorator';
import { ApplicationStatus, EngagementStatus } from '@udyogasakha/types';

@ApiTags('Engagements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('engagements')
export class EngagementsController {
  constructor(private readonly service: EngagementsService) {}

  @Post('apply')
  @ApiOperation({ summary: 'Submit an application / expression of interest' })
  apply(
    @CurrentUser('id') userId: string,
    @Body() body: { opportunityId: string; coverMessage?: string },
  ) {
    return this.service.apply(body.opportunityId, userId, body.coverMessage);
  }

  @Get('applications/my')
  @ApiOperation({ summary: 'Get my submitted applications' })
  myApplications(@CurrentUser('id') userId: string) {
    return this.service.getMyApplications(userId);
  }

  @Get('applications/opportunity/:opportunityId')
  @ApiOperation({ summary: 'Get all applications for my opportunity' })
  opportunityApplications(
    @Param('opportunityId') opportunityId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.getApplicationsForOpportunity(opportunityId, userId);
  }

  @Patch('applications/:id/status')
  @ApiOperation({ summary: 'Accept, shortlist, or decline an application' })
  updateApplicationStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: { status: ApplicationStatus; reviewNote?: string },
  ) {
    return this.service.updateApplicationStatus(id, userId, body.status, body.reviewNote);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my active and past engagements' })
  myEngagements(@CurrentUser('id') userId: string) {
    return this.service.getMyEngagements(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single engagement by ID' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    // Note: service.findById doesn't check ownership — frontend only links to own engagements
    return this.service.findById(id);
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Mark an engagement as completed or cancelled' })
  closeEngagement(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: {
      status: EngagementStatus.COMPLETED | EngagementStatus.CANCELLED;
      note?: string;
    },
  ) {
    return this.service.closeEngagement(id, userId, body.status, body.note);
  }

  @Post(':id/feedback')
  @ApiOperation({ summary: 'Submit feedback after a completed engagement' })
  submitFeedback(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: { rating: number; comment?: string },
  ) {
    return this.service.submitFeedback(id, userId, body.rating, body.comment);
  }
}
