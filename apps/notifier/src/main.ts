import { NestFactory } from '@nestjs/core';
import { type INestApplication, Logger } from '@nestjs/common';
import { type MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NotifierModule } from './notifier.module';
import { type Express } from 'express';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('NestBootstrap Notifier');

  const app =
    await NestFactory.create<INestApplication<Express>>(NotifierModule);

  await app.init();

  const configService = app.get<ConfigService>(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: configService.get('RMQ_URLS').split(', '),
    },
  });

  app.setGlobalPrefix(configService.get('GLOBAL_PREFIX', 'api/v1'));

  await app.startAllMicroservices();
  logger.log('Microservice Notifier is running');

  await app.listen(configService.get<number>('PORT', { infer: true }));
  logger.log(`Application is running on: ${await app.getUrl()}`);
}

void bootstrap();
