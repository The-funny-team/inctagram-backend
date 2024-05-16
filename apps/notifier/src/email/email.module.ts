import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import * as path from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailConfig } from '../config';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // todo: Вынести в модуль
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'development'
          ? 'envs/.upload.files.development.env'
          : 'envs/.upload.files.env',
    }),
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => {
        const pathToHbs = path.join(
          __dirname,
          '..',
          '..',
          '..',
          '..',
          'email',
          'templates',
        );
        return {
          transport: {
            service: 'Gmail',
            auth: {
              user: config.get<string>('TECH_EMAIL'),
              pass: config.get<string>('TECH_EMAIL_PASSWORD'),
            },
          },
          defaults: {
            from: `"No Reply" <${config.get<string>('TECH_EMAIL')}>`,
          },
          template: {
            dir: pathToHbs,
            adapter: new HandlebarsAdapter(undefined, {
              inlineCssEnabled: true,
            }),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [EmailController],
  providers: [EmailService, EmailConfig, EmailService],
})
export class EmailModule {}
