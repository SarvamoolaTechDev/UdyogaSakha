import { Controller, Get, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
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
  @ApiOperation({ summary: 'Update current user profile fields' })
  updateProfile(@CurrentUser('id') userId: string, @Body() dto: Record<string, unknown>) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete own account (DPDP right to erasure)',
    description: 'Permanently deletes the account. Active engagements must be closed first. Audit logs are retained per legal retention policy.',
  })
  async deleteAccount(@CurrentUser('id') userId: string) {
    await this.usersService.deleteAccount(userId);
  }

  // ── Admin routes ──────────────────────────────────────────────────────────

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: '[Admin] Search and list users' })
  list(@Query('search') search = '', @Query('limit') limit = 50) {
    return this.usersService.search(search, +limit).then((users) =>
      users.map((u) => this.usersService.sanitize(u)),
    );
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: '[Admin] Get any user by ID' })
  async findOne(@Param('id') id: string) {
    return this.usersService.sanitize(await this.usersService.findById(id));
  }

  @Patch(':id/roles')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Update roles for a user' })
  updateRoles(
    @Param('id') id: string,
    @Body() body: { roles: UserRole[] },
  ) {
    return this.usersService.updateRoles(id, body.roles);
  }
}
