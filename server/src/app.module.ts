import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { LoggerModule } from './utils/logger/logger.module';
import { TraceMiddleware } from './utils/logger/trace.middleware';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [LoggerModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TraceMiddleware).forRoutes('*');
  }
}
