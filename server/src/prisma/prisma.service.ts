import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { Logger } from 'winston';

import { PrismaClient } from './generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger();
  constructor() {
    const adapter = new PrismaPg(process.env.DATABASE_URL!);
    super({
      adapter,
      log: ['info', 'warn', 'error'],
      errorFormat: 'pretty',
    });
  }
  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.info('✅ Prisma connected to PostgreSQL');
    } catch (error) {
      this.logger.error('❌ Prisma connection error:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.info('🔌 Prisma disconnected from PostgreSQL');
  }
}
