import { User, UserRegistrationInfo } from '@prisma/client';

type UserByEmailOrUsername = Pick<
  User,
  'id' | 'email' | 'name' | 'hashPassword'
>;

type UserInfoIsConfirmed = Pick<UserRegistrationInfo, 'id' | 'isConfirmed'>;

export type CreatedUserWithRegistrationInfo = UserByEmailOrUsername & {
  userRegistrationInfo: UserInfoIsConfirmed;
};
