import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User } from '../prisma/generated/prisma/client';
import { UsersService } from '../users/users.service';
import { WinstonLogger } from '../utils/logger/logger';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface UserInfo {
  id: string;
  userEmail: string;
  userName: string;
  userSurname: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly logger: WinstonLogger,
  ) {}

  async register(input: RegisterDto): Promise<{ accessToken: string }> {
    const { email, password, userName, userSurname } = input;

    this.logger.info('AuthService.register called', {
      email,
      userName,
      userSurname,
    });

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      this.logger.warn('Registration failed: email already in use', { email });
      throw new BadRequestException('Email already in use');
    }

    this.logger.debug('Hashing password', { email });

    const passwordHash = await bcrypt.hash(password, 10);

    this.logger.debug('Creating user in database', { email });

    const user = await this.usersService.create(
      email,
      passwordHash,
      userName,
      userSurname,
    );

    this.logger.info('User registered successfully', {
      userId: user.id,
      email,
    });

    return this.signToken(user);
  }

  async login(input: LoginDto): Promise<{ accessToken: string }> {
    const { email, password } = input;
    this.logger.info('AuthService.login called', { email });

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      this.logger.warn('Login failed: user not found', { email });
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      this.logger.warn('Login failed: invalid password', {
        userId: user.id,
        email,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.info('Login successful', {
      userId: user.id,
      email,
    });

    return this.signToken(user);
  }

  private signToken(user: User) {
    this.logger.debug('Signing JWT token', {
      userId: user.id,
      email: user.userEmail,
    });

    const payload = {
      sub: user.id,
      email: user.userEmail,
    };

    const accessToken = this.jwtService.sign(payload);

    this.logger.debug('JWT token generated', { userId: user.id });

    return { accessToken };
  }

  async getUserProfile(userId: string): Promise<UserInfo> {
    this.logger.info('AuthService.me called', { userId });

    const user = await this.usersService.findById(userId);
    if (!user) {
      this.logger.warn('AuthService.me failed: user not found', { userId });
      throw new UnauthorizedException();
    }

    this.logger.info('AuthService.me success', {
      userId: user.id,
      email: user.userEmail,
    });

    const userInfo: UserInfo = {
      id: user.id,
      userEmail: user.userEmail,
      userName: user.userName,
      userSurname: user.userSurname,
    };

    return userInfo;
  }

  async validateOAuthLogin({
    provider,
    providerId,
    email,
    userName,
    userSurname,
  }: {
    provider: string;
    providerId: string;
    email: string;
    userName?: string;
    userSurname?: string;
  }) {
    let user = await this.usersService.findByProviderId(provider, providerId);

    if (!user) {
      user = await this.usersService.createOAuthUser({
        provider,
        providerId,
        email,
        userName,
        userSurname,
      });
    }

    return this.signToken(user);
  }
}
