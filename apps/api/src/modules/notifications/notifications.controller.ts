import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/roles.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get my notifications (last 50)' })
  getAll(
    @CurrentUser('id') userId: string,
    @Query('unread') unread?: string,
  ) {
    return unread === 'true'
      ? this.service.getUnread(userId)
      : this.service.getAll(userId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get count of unread notifications' })
  getUnreadCount(@CurrentUser('id') userId: string) {
    return this.service.getUnreadCount(userId).then((count) => ({ count }));
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  markRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.markRead(id, userId);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllRead(@CurrentUser('id') userId: string) {
    return this.service.markAllRead(userId);
  }
}
