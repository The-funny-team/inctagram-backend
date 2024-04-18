import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserConfig } from '../../config';
import { UserRepository } from '../../db';
import { CreateUserDto, CreateUserInfoDto } from '../../dto';
import { UserService } from '../../user.service';
import { validateOrRejectModel } from '../../../../core/config';
import { Result } from '../../../../core/result';
import { BadRequestError } from '../../../../core/exceptions';
import {
  ERROR_EMAIL_IS_ALREADY_REGISTRED,
  ERROR_USERNAME_IS_ALREADY_REGISTRED,
} from '../../user.constants';
import { CreatedUserWithRegistrationInfo } from '../../types';
import { EventEmitter2 } from '@nestjs/event-emitter';

export class CreateUserCommand {
  constructor(public userDto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly userConfig: UserConfig,
    private readonly userService: UserService,
    private readonly userRepo: UserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute({
    userDto,
  }: CreateUserCommand): Promise<Result<CreatedUserWithRegistrationInfo>> {
    console.log('enter CreateUserUseCase');
    await validateOrRejectModel(userDto, CreateUserDto);

    console.log('validated');

    const userByEmail = await this.userRepo.findByUsernameOrEmail(
      userDto.email,
    );

    console.log('userByEmail');

    if (this.isCorrectNotConfirmedUser(userByEmail, userDto)) {
      await this.userService.updateConfirmationCode(
        userByEmail.userRegistrationInfo.id,
        userByEmail.email,
      );
      console.log('successfully update');
      return Result.Ok(userByEmail);
    }

    if (userByEmail) {
      return Result.Err(
        new BadRequestError(ERROR_EMAIL_IS_ALREADY_REGISTRED, 'email'),
      );
    }

    const userByLogin = await this.userRepo.findByUsernameOrEmail(
      userDto.username,
    );

    if (userByLogin) {
      return Result.Err(
        new BadRequestError(ERROR_USERNAME_IS_ALREADY_REGISTRED, 'username'),
      );
    }

    userDto.password = this.userService.generatePasswordHash(userDto.password);

    console.log('password generated');

    const userInfo = this.getUserInfo();
    console.log('userInfo');
    const createdUser = await this.userRepo.create(userDto, userInfo);

    console.log('createdUser', createdUser);

    this.userService.createUserInfoCreatedEvent(
      createdUser.email,
      userInfo.confirmationCode,
    );

    console.log('event created');

    return Result.Ok(createdUser);
  }

  private getUserInfo() {
    const confirmationCode = this.userService.generateConfirmationCode();
    const userInfo: CreateUserInfoDto = {
      confirmationCode: confirmationCode.code,
      expirationConfirmationCode: confirmationCode.expiration,
    };
    return userInfo;
  }

  private isCorrectNotConfirmedUser(
    user: CreatedUserWithRegistrationInfo,
    userDto: CreateUserDto,
  ): boolean {
    return (
      user &&
      user.name === userDto.username &&
      user.email === userDto.email &&
      this.userService.isCorrectPassword(userDto.password, user.hashPassword) &&
      !user.userRegistrationInfo.isConfirmed
    );
  }
}
