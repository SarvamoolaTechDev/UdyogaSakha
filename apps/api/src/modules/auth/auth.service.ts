import {
  Injectable, UnauthorizedException, ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { TokenStoreService } from './token-store.service';
import type { RegisterInput, LoginInput } from '@udyogasakha/validators';
import type { AuthTokens } from '@udyogasakha/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly tokenStore: TokenStoreService,
  ) {}

  async register(dto: RegisterInput): Promise<AuthTokens> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('An account with this email already exists');
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({ ...dto, passwordHash });
    return this.issueTokens(user.id, user.email);
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    if (user.status !== 'ACTIVE' && user.status !== 'PENDING_VERIFICATION') {
      throw new UnauthorizedException(`Account is ${user.status.toLowerCase()}`);
    }
    return user;
  }

  async login(dto: LoginInput): Promise<AuthTokens> {
    const user = await this.validateUser(dto.email, dto.password);
    return this.issueTokens(user.id, user.email);
  }

  async refresh(userId: string, oldRefreshToken: string): Promise<AuthTokens> {
    const user = await this.usersService.findById(userId);
    const oldHash = this.hashToken(oldRefreshToken);
    const isValid = await this.tokenStore.isValid(userId, oldHash);
    if (!isValid) {
      await this.tokenStore.revokeAll(userId);
      throw new UnauthorizedException('Refresh token has been revoked or already used');
    }
    await this.tokenStore.revoke(userId, oldHash);
    return this.issueTokens(user.id, user.email);
  }

  async logout(userId: string): Promise<void> {
    await this.tokenStore.revokeAll(userId);
  }

  private async issueTokens(userId: string, email: string): Promise<AuthTokens> {
    const payload = { sub: userId, email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });
    await this.tokenStore.store(userId, this.hashToken(refreshToken));
    return { accessToken, refreshToken, expiresIn: 900 };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
