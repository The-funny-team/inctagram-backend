import { Inject, Injectable, Logger } from '@nestjs/common';
import { MicroservicesEnum } from '@libs/types/microservices.enum';
import { ClientProxy } from '@nestjs/microservices';
import { SendEmailDto } from '@libs/contracts/email/send-email.dto';

@Injectable()
export class EmailAdapter {
  logger = new Logger(EmailAdapter.name);

  constructor(
    @Inject(MicroservicesEnum.NOTIFIER_SERVICE)
    private readonly client: ClientProxy,
  ) {}

  async sendEmailConfirmationCode(dto: SendEmailDto): Promise<void> {
    this.client.emit<number>(
      { cmd: 'email-notification', type: 'confirmation' },
      dto,
    );
  }

  async sendRecoveryPasswordTempCode(dto: SendEmailDto) {
    this.client.emit<number>(
      { cmd: 'email-notification', type: 'recovery' },
      dto,
    );
  }
}
