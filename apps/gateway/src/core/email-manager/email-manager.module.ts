import { Module } from '@nestjs/common';
import { EmailManagerListener } from './email-manager.listener';
import { EmailConfig } from '../../../../notifier/src/config';
import { AppConfig } from '../config/application';
import { EmailAdapter } from './email.adapter';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MicroservicesEnum } from '@libs/types/microservices.enum';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ClientsModule.registerAsync([
      {
        name: MicroservicesEnum.NOTIFIER_SERVICE,
        imports: [],
        useFactory: (configService: ConfigService) => {
          return {
            transport: Transport.RMQ,
            options: {
              urls: configService.get('RMQ_URLS')?.split(', ') ?? [],
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [EmailManagerListener, EmailConfig, AppConfig, EmailAdapter],
})
export class EmailManagerModule {}
