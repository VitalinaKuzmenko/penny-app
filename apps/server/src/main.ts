import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import Joi from 'joi';
import { cleanupOpenApiDoc } from 'nestjs-zod';

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
    DOMAIN: Joi.string().required(),
  }),
});
async function bootstrap() {
  // 🎯 This is the magic line that makes Zod work with Swagger
  // cleanupOpenApiDoc();

  // const openApiDoc = SwaggerModule.createDocument(
  //   app,
  //   new DocumentBuilder()
  //     .setTitle('Example API')
  //     .setDescription('Example API description')
  //     .setVersion('1.0')
  //     .build(),
  // );

  // +SwaggerModule.setup('api', app, cleanupOpenApiDoc(openApiDoc));

  // Create comprehensive OpenAPI documentation

  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: process.env.UI_APP_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Penny App API')
    .setDescription('API documentation')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:8080', 'Development server')
    .build();

  // Generate the Swagger document
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, cleanupOpenApiDoc(document));

  await app.listen(process.env.PORT ?? 8080);

  // eslint-disable-next-line no-console
  console.log(
    `Application is running on: http://localhost:${process.env.PORT ?? 8080}`,
  );
}
bootstrap();
