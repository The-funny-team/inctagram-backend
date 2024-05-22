export const USER_RECOVERY_PASSWORD_EVENT_NAME = 'recoveryCode.update';

export class UserRecoveryPasswordEvent {
  constructor(
    public readonly email: string,
    public readonly recoveryCode: string,
  ) {}
}
