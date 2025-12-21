import { ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import Joi from 'joi';

import { AppModule } from './app.module';
import configuration from './config/configuration';

ConfigModule.forRoot({
  load: [configuration],
  validationSchema: Joi.object({
    PORT: Joi.number().default(8080),
    DATABASE_URL: Joi.string().required(),
    GOOGLE_CLIENT_ID: Joi.string().required(),
    GOOGLE_CLIENT_SECRET: Joi.string().required(),
    GOOGLE_CALLBACK_URL: Joi.string().required(),
    UI_APP_URL: Joi.string().required(),
  }),
});
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: process.env.UI_APP_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 8080);

  // eslint-disable-next-line no-console
  console.log(
    `Application is running on: http://localhost:${process.env.PORT ?? 8080}`,
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips unknown properties
      forbidNonWhitelisted: true,
      transform: true, // convert primitive types
    }),
  );
}
bootstrap();
