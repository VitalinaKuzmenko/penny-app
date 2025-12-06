import { Module, Global } from '@nestjs/common';
import { WinstonLogger } from './logger';

@Global()
@Module({
  providers: [
    {
      provide: WinstonLogger,
      useFactory: async () => await WinstonLogger.getInstance(),
    },
  ],
  exports: [WinstonLogger],
})
export class LoggerModule {}
