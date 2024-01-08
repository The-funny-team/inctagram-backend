import { UserProvider } from '@prisma/client';

type OptionalFields = Partial<Pick<UserProvider, 'id' | 'name' | 'email'>>;
type RequiredFields = Omit<UserProvider, 'id' | 'name' | 'email'>;

export type LinkProviderUserToExistingUser = OptionalFields & RequiredFields;
