import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';

import { AccountsModule } from './accounts/accounts.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ImportModule } from './import/import.module';
import { AccountModule } from './modules/account/account.module';
import { CategoryModule } from './modules/category/category.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';
import { LoggerModule } from './utils/logger/logger.module';
import { TraceMiddleware } from './utils/logger/trace.middleware';

@Module({
  imports: [
    LoggerModule,
    PrismaModule,
    UserModule,
    AccountModule,
    CategoryModule,
    TransactionModule,
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ImportModule,
    AccountsModule,
  ],

  controllers: [AppController],
  providers: [
    AppService,
    UsersService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe, // 🎯 Global Zod validation
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TraceMiddleware).forRoutes('*');
  }
}
