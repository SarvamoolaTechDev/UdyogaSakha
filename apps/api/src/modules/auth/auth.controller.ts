import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RegisterSchema, LoginSchema, RegisterInput, LoginInput } from '@udyogasakha/validators';
import { ZodPipe } from '../../common/pipes/zod.pipe';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new participant' })
  register(@Body(new ZodPipe(RegisterSchema)) dto: RegisterInput) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and receive JWT tokens' })
  login(@Body(new ZodPipe(LoginSchema)) dto: LoginInput) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  refresh(@Req() req: any) {
    return this.authService.refresh(req.user.id);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout (client should discard tokens)' })
  logout() {
    // Stateless JWT — client discards tokens.
    // TODO Phase 2: add token blocklist in Redis for sensitive accounts
    return { message: 'Logged out successfully' };
  }
}
