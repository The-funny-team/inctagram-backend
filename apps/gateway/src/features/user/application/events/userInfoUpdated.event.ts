export const USER_UPDATED_EVENT_NAME = 'confirmationCode.updated';

export class UserInfoUpdatedEvent {
  constructor(
    public readonly email: string,
    public readonly configmationCode: string,
  ) {}
}
