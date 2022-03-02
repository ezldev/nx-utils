/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import * as compression from 'compression';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WsAdapter } from '@nestjs/platform-ws';
//import  helmet from 'helmet';
//import * as csurf from 'csurf';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(compression());
  //app.use(helmet());
  app.enableCors();
  //app.use(csurf());

  app.useWebSocketAdapter(new WsAdapter(app));
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3333;
  const config = new DocumentBuilder()
    .setTitle('Nx utils')
    .setDescription('About NX utility')
    .setVersion('1.0')
    .addTag('NX Utils')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(globalPrefix, app, document);
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
