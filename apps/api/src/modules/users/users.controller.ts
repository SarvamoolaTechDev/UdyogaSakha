import { Controller, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@udyogasakha/types';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@CurrentUser('id') userId: string) {
    return this.usersService.sanitize(await this.usersService.findById(userId));
  }

  @Patch('me/profile')
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(@CurrentUser('id') userId: string, @Body() dto: Record<string, unknown>) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: '[Admin] Search and list users' })
  list(@Query('search') search = '') {
    return this.usersService.search(search).then((users) => users.map((u) => this.usersService.sanitize(u)));
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: '[Admin] Get any user by ID' })
  async findOne(@Param('id') id: string) {
    return this.usersService.sanitize(await this.usersService.findById(id));
  }
}
