import { Injectable, Logger } from '@nestjs/common';
import { EmailSenderService } from './email-sender.service';
import { type SendEmailDto } from '@libs/contracts/email/send-confirmation-email-code';
import { MailerService } from '@nestjs-modules/mailer';
import { Template } from './templates';
import { EmailConfig } from '../config';

@Injectable()
export class EmailService extends EmailSenderService {
  logger = new Logger(EmailService.name);

  constructor(
    protected readonly mailerService: MailerService,
    private readonly emailConfig: EmailConfig,
  ) {
    super(mailerService);
  }

  async sendConfirmToken({ token, email, userName }: SendEmailDto) {
    await this.sendEmail(email, 'Confirm your email', Template.CONFIRM_EMAIL, {
      name: userName,
      confirmationLink: `${this.emailConfig.confirmRegisterLink}${token}`,
    });
  }

  async sendRecoveryToken({ token, email, userName }: SendEmailDto) {
    await this.sendEmail(
      email,
      'Recovery your password',
      Template.RECOVERY_PASSWORD,
      {
        name: userName,
        resetLink: `${this.emailConfig.confirmRecoveryPasswordLink}${token}`,
      },
    );
  }
}
