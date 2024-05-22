import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailConfig {
  constructor(protected configService: ConfigService) {}

  getEmailSettings() {
    return {
      TECH_EMAIL: this.configService.get<string>('TECH_EMAIL') ?? '',
      TECH_EMAIL_PASSWORD:
        this.configService.get<string>('TECH_EMAIL_PASSWORD') ?? '',
      TECH_EMAIL_HOST: this.configService.get<string>('TECH_EMAIL_HOST') ?? '',
      TECH_EMAIL_PORT: this.configService.get<number>('TECH_EMAIL_PORT') ?? 465,
      TECH_EMAIL_SECURE:
        this.configService.get<boolean>('TECH_EMAIL_SECURE') ?? true,
    };
  }

  get confirmRegisterLink(): string {
    return (
      this.configService.get<string>('FRONTEND_EMAIL_CONFIRMATION_URL') ?? ''
    );
  }
  get confirmRecoveryPasswordLink(): string {
    return (
      this.configService.get<string>(
        'FRONTEND_EMAIL_CONFIRMATION_PASSWORD_RECOVERY_URL',
      ) ?? ''
    );
  }
}
