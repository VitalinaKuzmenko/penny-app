import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { WinstonLogger } from '../utils/logger/logger';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const users = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };
  const jwt = { sign: jest.fn().mockReturnValue('signed.jwt') };

  const registerInput = {
    email: 'new@penny.app',
    password: 'correct-horse-battery',
    userName: 'Ada',
    userSurname: 'Lovelace',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: users },
        { provide: JwtService, useValue: jwt },
        {
          provide: WinstonLogger,
          useValue: {
            info: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('rejects an email that is already taken', async () => {
      users.findByEmail.mockResolvedValue({ id: 'existing' });

      await expect(service.register(registerInput)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(users.create).not.toHaveBeenCalled();
    });

    it('hashes the password, creates the user and returns a token', async () => {
      users.findByEmail.mockResolvedValue(null);
      users.create.mockResolvedValue({
        id: 'u1',
        userEmail: registerInput.email,
      });

      const result = await service.register(registerInput);

      expect(result).toEqual({ accessToken: 'signed.jwt' });
      const [email, passwordHash] = users.create.mock.calls[0];
      expect(email).toBe(registerInput.email);
      expect(passwordHash).not.toBe(registerInput.password);
      await expect(
        bcrypt.compare(registerInput.password, passwordHash),
      ).resolves.toBe(true);
      expect(jwt.sign).toHaveBeenCalledWith({
        sub: 'u1',
        email: registerInput.email,
      });
    });
  });

  describe('login', () => {
    const login = { email: 'ada@penny.app', password: 'secret' };

    it('rejects an unknown email', async () => {
      users.findByEmail.mockResolvedValue(null);

      await expect(service.login(login)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejects an OAuth-only account that has no password', async () => {
      users.findByEmail.mockResolvedValue({ id: 'u1', passwordHash: null });

      await expect(service.login(login)).rejects.toMatchObject({
        response: { code: 'auth.oauth_only_account' },
      });
    });

    it('rejects a wrong password', async () => {
      users.findByEmail.mockResolvedValue({
        id: 'u1',
        passwordHash: await bcrypt.hash('something-else', 4),
      });

      await expect(service.login(login)).rejects.toMatchObject({
        response: { code: 'auth.password_invalid' },
      });
    });

    it('returns a token for valid credentials', async () => {
      users.findByEmail.mockResolvedValue({
        id: 'u1',
        userEmail: login.email,
        passwordHash: await bcrypt.hash(login.password, 4),
      });

      await expect(service.login(login)).resolves.toEqual({
        accessToken: 'signed.jwt',
      });
    });
  });
});
