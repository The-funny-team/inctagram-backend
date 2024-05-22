import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EmailService } from './email.service';
import { SendEmailDto } from '@libs/contracts/email/send-email.dto';

@Controller()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @EventPattern({ cmd: 'email-notification', type: 'confirmation' })
  async sendConfirmation(@Payload() data: SendEmailDto): Promise<void> {
    await this.emailService.sendConfirmToken(data);
  }

  @EventPattern({ cmd: 'email-notification', type: 'recovery' })
  async sendRecovery(@Payload() data: SendEmailDto): Promise<void> {
    await this.emailService.sendRecoveryToken(data);
  }
}
