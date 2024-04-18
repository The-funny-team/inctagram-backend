export const USER_CREATED_EVENT_NAME = 'confirmationCode.created';

export class UserInfoCreatedEvent {
  constructor(
    public readonly email: string,
    public readonly configmationCode: string,
  ) {}
}
