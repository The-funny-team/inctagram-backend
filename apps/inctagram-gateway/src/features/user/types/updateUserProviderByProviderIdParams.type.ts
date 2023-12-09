import { UserProvider } from '@prisma/client';

export type UpdateUserProviderByProviderIdParams = Pick<
  UserProvider,
  'userId' | 'providerUserId' | 'provider'
>;
