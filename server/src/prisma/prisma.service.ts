import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';

import { WinstonLogger } from 'src/utils/logger/logger';

import { PrismaClient } from './generated/prisma/client';
import { parse } from 'pg-connection-string';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private readonly logger: WinstonLogger) {
    const config = parse(process.env.DATABASE_URL!);
    const adapter = new PrismaPg({
      host: config.host,
      port: Number(config.port),
      user: config.user,
      password: config.password,
      database: config.database,
    });

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
      this.logger.error('❌ Prisma connection error:', error as Error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.info('🔌 Prisma disconnected from PostgreSQL');
  }
}
