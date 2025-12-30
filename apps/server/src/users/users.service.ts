import { Injectable } from '@nestjs/common';

import { DEFAULT_CATEGORIES } from '../categories/default-categories';
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
    userName: string,
    userSurname: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create user
      const user = await tx.user.create({
        data: {
          userEmail: email,
          passwordHash,
          userName,
          userSurname,
        },
      });

      // 2. Create default categories for this user
      await tx.category.createMany({
        data: DEFAULT_CATEGORIES.map((category) => ({
          name: category.name,
          icon: category.icon,
          color: category.color,
          isDefault: true,
          userId: user.id,
        })),
      });

      return user;
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

  async createOAuthUser2({
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
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          provider,
          providerId,
          userEmail: email,
          userName,
          userSurname,
        },
      });

      await tx.category.createMany({
        data: DEFAULT_CATEGORIES.map((category) => ({
          name: category.name,
          icon: category.icon,
          color: category.color,
          isDefault: true,
          userId: user.id,
        })),
      });

      return user;
    });
  }
}
