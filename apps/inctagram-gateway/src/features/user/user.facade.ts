import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  CreateUserDto,
  NewPasswordDto,
  RegistrationEmailResendingDto,
  UserPasswordRecoveryDto,
} from './dto';
import { UserQueryRepository } from './db/user.query.repository';
import { ResponseUserDto } from './responses';
import { Provider, User } from '@prisma/client';
import { Result } from '../../core/result';
import {
  ConfirmationRegistrationCommand,
  CreateUserCommand,
  LinkProviderUserToExistingUserCommand,
  NewPasswordCommand,
  PasswordRecoveryResendingCommand,
} from './application';
import { ConfirmationCodeDto } from '../auth/dto';
import { CheckUserCredentialsCommand } from './application/use-cases/checkUserCredentials';
import { LoginDto } from '../auth/dto/login.dto';
import { UserId } from './types/userId.type';
import { UserPasswordRecoveryCommand } from './application/use-cases/userPasswordRecovery.usecase';
import { UserRepository } from './db';
import {
  UpdateUserProviderByProviderIdData,
  UpdateUserProviderByProviderIdParams,
} from './types';
import { ProviderUserResponse } from '../auth/response';
import { RegistrationEmailResendingCommand } from './application/use-cases/registrationEmailResending.usecase';
import { PasswordRecoveryResendingDto } from './dto/passwordRecoveryResending.dto';

@Injectable()
export class UserFacade {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly userRepo: UserRepository,
    private readonly userQueryRepo: UserQueryRepository,
  ) {}

  repository = {
    findUserProviderByProviderId: (
      providerUserId: string,
      provider: Provider,
    ) => this.findUserProviderByProviderId(providerUserId, provider),
    updateUserProviderByProviderId: (
      params: UpdateUserProviderByProviderIdParams,
      data: UpdateUserProviderByProviderIdData,
    ) => this.updateUserProviderByProviderId(params, data),
    findUserById: (userId: string) => this.findUserById(userId),
  };

  useCases = {
    createUser: (userDto: CreateUserDto) => this.createUser(userDto),
    confirmationRegistration: (confirmDto: ConfirmationCodeDto) =>
      this.confirmationRegistration(confirmDto),
    checkUserCredentials: (loginDto: LoginDto): Promise<Result<UserId>> =>
      this.checkUserCredentials(loginDto),
    passwordRecovery: (passwordRRecoveryDto: UserPasswordRecoveryDto) =>
      this.passwordRecovery(passwordRRecoveryDto),
    newPassword: (dto: NewPasswordDto): Promise<Result<User>> =>
      this.newPassword(dto),
    linkProviderUserToExistingUser: (
      provider: Provider,
      userData: ProviderUserResponse,
    ): Promise<Result<string>> =>
      this.linkProviderUserToExistingUser(provider, userData),
    registrationEmailResending: (
      resendingDto: RegistrationEmailResendingDto,
    ): Promise<Result> => this.registrationEmailResending(resendingDto),
    passwordRecoveryResending: (resendingDto: PasswordRecoveryResendingDto) =>
      this.passwordRecoveryResending(resendingDto),
  };
  queries = { getUserViewById: (id: string) => this.getUserViewById(id) };

  private async createUser(userDto: CreateUserDto): Promise<Result<User>> {
    return this.commandBus.execute<CreateUserCommand, Result<User>>(
      new CreateUserCommand(userDto),
    );
  }

  private async confirmationRegistration(
    confirmDto: ConfirmationCodeDto,
  ): Promise<Result<boolean>> {
    return this.commandBus.execute<
      ConfirmationRegistrationCommand,
      Result<boolean>
    >(new ConfirmationRegistrationCommand(confirmDto));
  }

  private async checkUserCredentials(loginDto: LoginDto) {
    return this.commandBus.execute<CheckUserCredentialsCommand, Result<UserId>>(
      new CheckUserCredentialsCommand(loginDto),
    );
  }

  private async passwordRecovery(
    passwordRRecoveryDto: UserPasswordRecoveryDto,
  ): Promise<Result> {
    return this.commandBus.execute<UserPasswordRecoveryCommand, Result>(
      new UserPasswordRecoveryCommand(passwordRRecoveryDto),
    );
  }

  private async newPassword(dto: NewPasswordDto): Promise<Result<User>> {
    return this.commandBus.execute<NewPasswordCommand, Result>(
      new NewPasswordCommand(dto),
    );
  }

  private async getUserViewById(id: string): Promise<Result<ResponseUserDto>> {
    return this.userQueryRepo.getUserViewById(id);
  }

  private async findUserProviderByProviderId(
    providerUserId: string,
    provider: Provider,
  ) {
    return this.userRepo.findUserProviderByProviderId(providerUserId, provider);
  }

  private async updateUserProviderByProviderId(
    params: UpdateUserProviderByProviderIdParams,
    data: UpdateUserProviderByProviderIdData,
  ) {
    return this.userRepo.updateUserProviderByProviderId(params, data);
  }

  private async linkProviderUserToExistingUser(
    provider: Provider,
    userData: ProviderUserResponse,
  ): Promise<Result<string>> {
    return this.commandBus.execute<
      LinkProviderUserToExistingUserCommand,
      Result<string>
    >(new LinkProviderUserToExistingUserCommand(provider, userData));
  }

  private async registrationEmailResending(
    resendingDto: RegistrationEmailResendingDto,
  ): Promise<Result> {
    return this.commandBus.execute<RegistrationEmailResendingCommand, Result>(
      new RegistrationEmailResendingCommand(resendingDto),
    );
  }

  private async passwordRecoveryResending(
    resendingDto: PasswordRecoveryResendingDto,
  ) {
    return this.commandBus.execute<PasswordRecoveryResendingCommand, Result>(
      new PasswordRecoveryResendingCommand(resendingDto),
    );
  }

  private async findUserById(userId: string) {
    return this.userRepo.findById(userId);
  }
}
