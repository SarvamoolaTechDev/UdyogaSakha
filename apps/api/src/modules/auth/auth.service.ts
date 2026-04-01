import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterInput, LoginInput } from '@udyogasakha/validators';
import { AuthTokens } from '@udyogasakha/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterInput): Promise<AuthTokens> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({ ...dto, passwordHash });

    return this.generateTokens(user.id, user.email);
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (user.status !== 'active') {
      throw new UnauthorizedException(`Account is ${user.status}`);
    }

    return user;
  }

  async login(dto: LoginInput): Promise<AuthTokens> {
    const user = await this.validateUser(dto.email, dto.password);
    return this.generateTokens(user.id, user.email);
  }

  async refresh(userId: string): Promise<AuthTokens> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();
    return this.generateTokens(user.id, user.email);
  }

  private generateTokens(userId: string, email: string): AuthTokens {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return { accessToken, refreshToken, expiresIn: 900 }; // 15min in seconds
  }
}
