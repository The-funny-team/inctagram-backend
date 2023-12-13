import { UserRegistrationInfo } from '@prisma/client';

export type CreateUserInfoDto = Pick<
  UserRegistrationInfo,
  'confirmationCode' | 'expirationConfirmationCode'
>;
