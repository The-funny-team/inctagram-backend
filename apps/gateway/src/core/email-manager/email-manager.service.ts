import { Injectable } from '@nestjs/common';
import { EmailAdapter } from './email.adapter';
import {
  USER_CREATED_EVENT_NAME,
  USER_RECOVERY_PASSWORD_EVENT_NAME,
  USER_UPDATED_EVENT_NAME,
  UserInfoCreatedEvent,
  UserInfoUpdatedEvent,
  UserRecoveryPasswordEvent,
} from '../../features/user/application/events';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class EmailManagerService {
  constructor(private readonly emailAdapter: EmailAdapter) {}

  @OnEvent(USER_CREATED_EVENT_NAME)
  async sendEmailConfirmationMessage(payload: UserInfoCreatedEvent) {
    await this.emailAdapter.sendEmailConfirmationCode({
      email: payload.email,
      userName: payload.email.split('@')[0],
      token: payload.configmationCode,
    });
  }

  @OnEvent(USER_UPDATED_EVENT_NAME)
  async sendResendingEmailConfirmationMessage(payload: UserInfoUpdatedEvent) {
    await this.emailAdapter.sendEmailConfirmationCode({
      email: payload.email,
      userName: payload.email.split('@')[0],
      token: payload.configmationCode,
    });
  }

  @OnEvent(USER_RECOVERY_PASSWORD_EVENT_NAME)
  async sendPasswordRecovery(payload: UserRecoveryPasswordEvent) {
    await this.emailAdapter.sendRecoveryPasswordTempCode({
      email: payload.email,
      userName: payload.email.split('@')[0],
      token: payload.recoveryCode,
    });
  }
}
