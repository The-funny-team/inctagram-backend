import { UserProvider } from '@prisma/client';

export type UpdateUserProviderByProviderIdData = Partial<
  Pick<UserProvider, 'name' | 'email'>
>;
