import nodemailer from 'nodemailer';
import { Injectable, Logger } from '@nestjs/common';
import { EmailConfig } from './config';

@Injectable()
export class EmailAdapter {
  logger = new Logger(EmailAdapter.name);

  private TECH_EMAIL: string;
  private TECH_EMAIL_PASSWORD: string;
  private TECH_EMAIL_HOST: string;
  private TECH_EMAIL_PORT: number;
  private TECH_EMAIL_SECURE: boolean;

  constructor(private readonly emailConfig: EmailConfig) {
    const settings = emailConfig.getEmailSettings();
    this.TECH_EMAIL = settings.TECH_EMAIL;
    this.TECH_EMAIL_PASSWORD = settings.TECH_EMAIL_PASSWORD;
    this.TECH_EMAIL_HOST = settings.TECH_EMAIL_HOST;
    this.TECH_EMAIL_PORT = settings.TECH_EMAIL_PORT;
    this.TECH_EMAIL_SECURE = settings.TECH_EMAIL_SECURE;
  }

  async sendEmail(email: string, subject: string, textMessage: string) {
    const transporter = nodemailer.createTransport({
      host: this.TECH_EMAIL_HOST,
      port: this.TECH_EMAIL_PORT,
      secure: this.TECH_EMAIL_SECURE,
      auth: {
        user: this.TECH_EMAIL,
        pass: this.TECH_EMAIL_PASSWORD,
      },
    });

    const message = {
      from: `Learning platform <${this.TECH_EMAIL}>`,
      to: email,
      subject: subject,
      html: textMessage,
    };

    try {
      await transporter.sendMail(message);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
