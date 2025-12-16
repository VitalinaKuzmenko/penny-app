import { Injectable } from '@nestjs/common';

import { User } from '../prisma/generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
}
