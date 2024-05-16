import { Module } from '@nestjs/common';
import { NotifierService } from './notifier.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailModule } from './email/email.module';
import { HealthModule } from '@app/core/health/health.module';
import { AppConfigModule } from '@app/core/config/appConfigModule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'development'
          ? 'envs/.notifier.development.env'
          : 'envs/.notifier.env',
    }),
    AppConfigModule,
    HealthModule,
    EmailModule,
  ],
  providers: [ConfigService, NotifierService],
})
export class NotifierModule {}
