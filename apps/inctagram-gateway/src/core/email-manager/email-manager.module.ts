import { Module } from '@nestjs/common';
import { EmailManagerService } from './email-manager.service';
import { EmailConfig } from '../../infrastructure/adapters/email/config';
import { AppConfig } from '../config/application';
import { EmailAdapter } from '../../infrastructure';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [EmailManagerService, EmailConfig, AppConfig, EmailAdapter],
})
export class EmailManagerModule {}
