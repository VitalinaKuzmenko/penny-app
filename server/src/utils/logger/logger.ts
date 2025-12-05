import { Injectable, LoggerService, OnModuleInit } from '@nestjs/common';
import * as winston from 'winston';
import { Logger } from 'winston';
import { LogLevel } from './logger-interfaces';
import { AsyncContext } from './async-context';

// eslint-disable-next-line
const LokiTransport = require('winston-loki');

@Injectable()
export class WinstonLogger implements LoggerService, OnModuleInit {
  private static instance: WinstonLogger;
  private logger: Logger;

  async onModuleInit() {
    this.logger = await this.createLoggerClient();
  }

  static async getInstance(): Promise<WinstonLogger> {
    if (!WinstonLogger.instance) {
      WinstonLogger.instance = new WinstonLogger();
      await WinstonLogger.instance.onModuleInit();
    }
    return WinstonLogger.instance;
  }

  private customLogLevels = {
    levels: {
      crit: 0,
      error: 1,
      warn: 2,
      info: 3,
      debug: 6,
    },
    colors: {
      crit: 'red',
      error: 'red',
      warn: 'yellow',
      info: 'green',
      debug: 'blue',
    },
  };

  private async createLoggerClient(): Promise<Logger> {
    const isDevelopment =
      (process.env.NODE_ENV || 'development') === 'development';
    const lokiHost: string | undefined = process.env.LOKI_HOST;
    const defaultLoglevel = isDevelopment ? 'debug' : 'info';
    const silent = process.env.SILENT_LOG === 'true';
    const lokiAppLabel =
      process.env.LOKI_LOGGING_LABEL || 'core-digital-content';
    const imageTag = process.env.IMAGE_TAG || 'latest';

    const devFormat = new winston.transports.Console({
      format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.printf(({ level, message, ...meta }) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { version, ...metaWithoutVersion } = meta;
          return `${level} ${message} ${
            Object.keys(metaWithoutVersion).length
              ? `${JSON.stringify(metaWithoutVersion, null, 2)}`
              : ''
          }`;
        }),
      ),
    });

    const prodFormat = new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: new Date().toISOString() }),
        winston.format.errors({ stack: true }),
        winston.format.prettyPrint(),
        winston.format.json(),
      ),
    });

    const options = lokiHost
      ? {
          level: defaultLoglevel,
          transports: [
            new LokiTransport({
              host: lokiHost,
              labels: { app: lokiAppLabel },
              format: winston.format.combine(
                winston.format.timestamp({ format: new Date().toISOString() }),
                winston.format.errors({ stack: true }),
                winston.format.printf(({ level, ...meta }) => {
                  return JSON.stringify({
                    level: level,
                    ...meta,
                  });
                }),
              ),
              onConnectionError: (err) => console.error(err),
            }),
          ],
          silent,
          defaultMeta: { version: imageTag },
          levels: this.customLogLevels.levels,
        }
      : {
          level: defaultLoglevel,
          transports: [isDevelopment ? devFormat : prodFormat],
          silent,
          defaultMeta: { version: imageTag },
          levels: this.customLogLevels.levels,
        };

    const logger = winston.createLogger(options);
    winston.addColors(this.customLogLevels.colors);

    return logger;
  }

  private addTraceIdToDetails(
    details: Record<string, any>,
  ): Record<string, any> {
    const traceId = AsyncContext.get('traceId') as string;
    return { ...details, traceId };
  }

  log(
    message: string,
    level: LogLevel,
    error?: string | Error,
    details?: Record<string, any>,
  ) {
    const trace = error instanceof Error ? error.stack : error;
    this.logger.log(level, message, {
      trace,
      ...this.addTraceIdToDetails(details || {}),
    });
  }

  critical(
    message: string,
    error: string | Error,
    details?: Record<string, any>,
  ) {
    const trace = error instanceof Error ? error.stack : error;
    this.logger.log('crit', message, {
      trace,
      ...this.addTraceIdToDetails(details || {}),
    });
  }

  error(message: string, error: string | Error, details?: Record<string, any>) {
    const trace = error instanceof Error ? error.stack : error;
    this.logger.error(message, {
      trace,
      ...this.addTraceIdToDetails(details || {}),
    });
  }

  warn(message: string, details?: Record<string, any>) {
    this.logger.warn(message, this.addTraceIdToDetails(details || {}));
  }

  info(message: string, details?: Record<string, any>) {
    this.logger.info(message, this.addTraceIdToDetails(details || {}));
  }

  debug(message: string, details?: Record<string, any>) {
    this.logger.debug(message, this.addTraceIdToDetails(details || {}));
  }
}
