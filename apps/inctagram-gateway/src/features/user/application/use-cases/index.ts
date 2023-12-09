import { Type } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';
import { CreateUserUseCase } from './createUser.usecase';
import { ConfirmationRegistrationUseCase } from './confirmationRegistration.usecase';
import { UserPasswordRecoveryUseCase } from './userPasswordRecovery.usecase';
import { NewPasswordUseCase } from './newPassword.usecase';
import { CheckUserCredentialsUseCase } from './checkUserCredentials';
import { LinkProviderUserToExistingUserUseCase } from './linkProviderUserToExistingUser.usecase';
import { RegistrationEmailResendingUseCase } from './registrationEmailResending.usecase';
import { PasswordRecoveryResendingUseCase } from './passwordRecoveryResending.usecase';

export * from './createUser.usecase';
export * from './confirmationRegistration.usecase';
export * from './userPasswordRecovery.usecase';
export * from './newPassword.usecase';
export * from './checkUserCredentials';
export * from './linkProviderUserToExistingUser.usecase';
export * from './registrationEmailResending.usecase';
export * from './passwordRecoveryResending.usecase';

export const USER_USE_CASES: Type<ICommandHandler>[] = [
  CreateUserUseCase,
  ConfirmationRegistrationUseCase,
  UserPasswordRecoveryUseCase,
  NewPasswordUseCase,
  CheckUserCredentialsUseCase,
  LinkProviderUserToExistingUserUseCase,
  RegistrationEmailResendingUseCase,
  PasswordRecoveryResendingUseCase,
];
