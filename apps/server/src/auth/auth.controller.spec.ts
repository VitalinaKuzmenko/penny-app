import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = {
    register: jest.fn(),
    login: jest.fn(),
  };
  const res = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('sets the token as an HTTP-only cookie on login', async () => {
    authService.login.mockResolvedValue({ accessToken: 'jwt' });

    const result = await controller.login(
      { email: 'a@b.com', password: 'pw' },
      res,
    );

    expect(result).toEqual({ success: true });
    expect(res.cookie).toHaveBeenCalledWith(
      'access_token',
      'jwt',
      expect.objectContaining({
        httpOnly: true,
        path: '/',
        maxAge: 24 * 60 * 60 * 1000,
      }),
    );
  });

  it('sets the token as an HTTP-only cookie on register', async () => {
    authService.register.mockResolvedValue({ accessToken: 'jwt' });

    await controller.register(
      {
        email: 'a@b.com',
        password: 'password123',
        userName: 'A',
        userSurname: 'B',
      },
      res,
    );

    expect(res.cookie).toHaveBeenCalledWith(
      'access_token',
      'jwt',
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it('clears the cookie on logout', async () => {
    const result = await controller.logout(res);

    expect(result).toEqual({ success: true });
    expect(res.clearCookie).toHaveBeenCalledWith(
      'access_token',
      expect.objectContaining({ httpOnly: true, path: '/' }),
    );
  });
});
