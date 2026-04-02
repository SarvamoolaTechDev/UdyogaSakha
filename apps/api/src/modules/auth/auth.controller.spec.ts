import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  refresh: jest.fn(),
  logout: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();
    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('register() delegates to AuthService.register', async () => {
    const tokens = { accessToken: 'at', refreshToken: 'rt', expiresIn: 900 };
    mockAuthService.register.mockResolvedValue(tokens);

    const result = await controller.register({
      email: 'a@b.com', password: 'Test@1234', fullName: 'Test', participantType: 'INDIVIDUAL' as any,
    });
    expect(mockAuthService.register).toHaveBeenCalledTimes(1);
    expect(result).toEqual(tokens);
  });

  it('login() delegates to AuthService.login', async () => {
    const tokens = { accessToken: 'at', refreshToken: 'rt', expiresIn: 900 };
    mockAuthService.login.mockResolvedValue(tokens);

    const result = await controller.login({ email: 'a@b.com', password: 'Test@1234' });
    expect(result).toEqual(tokens);
  });

  it('logout() calls AuthService.logout and returns success message', async () => {
    mockAuthService.logout.mockResolvedValue(undefined);
    const result = await controller.logout('user-id');
    expect(mockAuthService.logout).toHaveBeenCalledWith('user-id');
    expect(result).toHaveProperty('message');
  });
});
