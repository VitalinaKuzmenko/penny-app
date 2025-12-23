import { Injectable } from '@nestjs/common';

import { User } from '../prisma/generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WinstonLogger } from '../utils/logger/logger';

import { CreateOAuthUserDto } from './dto/create-oauth-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: WinstonLogger,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { userEmail: email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(
    email: string,
    passwordHash: string,
    userName?: string,
    userSurname?: string,
  ): Promise<User> {
    return this.prisma.user.create({
      data: {
        userEmail: email,
        passwordHash,
        userName: userName || '',
        userSurname: userSurname || '',
      },
    });
  }

  async findByProviderId(provider: string, providerId: string) {
    this.logger.info('Finding user by providerId', { provider, providerId });
    return this.prisma.user.findUnique({
      where: { provider_providerId: { provider, providerId } },
    });
  }

  async createOAuthUser(dto: CreateOAuthUserDto) {
    this.logger.info('Creating OAuth user', { dto });

    return this.prisma.user.create({
      data: {
        provider: dto.provider,
        providerId: dto.providerId,
        userEmail: dto.email,
        userName: dto.userName,
        userSurname: dto.userSurname,
      },
    });
  }
}
