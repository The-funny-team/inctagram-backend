import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserConfig } from '../../config';
import { UserRegistrationInfoRepository, UserRepository } from '../../db';
import { CreateUserDto, CreateUserInfoDto } from '../../dto';
import { UserService } from '../../user.service';
import { validateOrRejectModel } from '../../../../core/config';
import { Result } from '../../../../core/result';
import { BadRequestError } from '../../../../core/exceptions';
import {
  ERROR_EMAIL_IS_ALREADY_REGISTRED,
  ERROR_USERNAME_IS_ALREADY_REGISTRED,
} from '../../user.constants';
import { FoundUserByEmailOrUsername } from '../../types';
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
    private readonly userRegistrationInfoRepo: UserRegistrationInfoRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute({ userDto }: CreateUserCommand): Promise<any> {
    await validateOrRejectModel(userDto, CreateUserDto);

    const userByEmail = await this.userRepo.findByUsernameOrEmail(
      userDto.email,
    );

    if (this.isCorrectNotConfirmedUser(userByEmail, userDto)) {
      await this.userService.updateConfirmationCode(
        userByEmail.userRegistrationInfo.id,
        userByEmail.email,
      );
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
    const createdUser = await this.userRepo.create(userDto);

    const userInfo = await this.createUserInfo(createdUser.id);
    this.userService.createUserInfoCreatedEvent(
      createdUser.email,
      userInfo.confirmationCode,
    );

    return Result.Ok(createdUser);
  }

  private async createUserInfo(userId: string) {
    const confirmationCode = this.userService.generateConfirmationCode();
    const userInfo: CreateUserInfoDto = {
      userId: userId,
      confirmationCode: confirmationCode.code,
      expirationConfirmationCode: confirmationCode.expiration,
    };

    return this.userRegistrationInfoRepo.create(userInfo);
  }

  private isCorrectNotConfirmedUser(
    user: FoundUserByEmailOrUsername,
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
