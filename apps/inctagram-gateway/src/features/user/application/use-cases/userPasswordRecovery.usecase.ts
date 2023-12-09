import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserPasswordRecoveryDto } from '../../dto';
import { validateOrRejectModel } from '../../../../core/config';
import { Result } from '../../../../core/result';
import { UserRepository } from '../../db';
import {
  USER_RECOVERY_PASSWORD_EVENT_NAME,
  UserRecoveryPasswordEvent,
} from '../events';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestError } from '../../../../core/exceptions';
import { ERROR_USER_WITH_THIS_EMAIL_NOT_EXIST } from '../../user.constants';
import { UserService } from '../../user.service';
import { UserRegistrationInfo } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { UserConfig } from '../../config';

export class UserPasswordRecoveryCommand {
  constructor(public passwordRecoveryDto: UserPasswordRecoveryDto) {}
}

@CommandHandler(UserPasswordRecoveryCommand)
export class UserPasswordRecoveryUseCase
  implements ICommandHandler<UserPasswordRecoveryCommand>
{
  constructor(
    private readonly userRepo: UserRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly userService: UserService,
    private readonly userConfig: UserConfig,
  ) {}

  async execute({
    passwordRecoveryDto,
  }: UserPasswordRecoveryCommand): Promise<Result> {
    await validateOrRejectModel(passwordRecoveryDto, UserPasswordRecoveryDto);

    const user = await this.userRepo.findByUsernameOrEmail(
      passwordRecoveryDto.email,
    );

    if (!user) {
      return Result.Err(
        new BadRequestError(ERROR_USER_WITH_THIS_EMAIL_NOT_EXIST, 'email'),
      );
    }

    if (!user.userRegistrationInfo.isConfirmed) {
      await this.userService.updateConfirmationCode(
        user.userRegistrationInfo.id,
        user.email,
      );
      return Result.Ok();
    }

    await this.updateRecoveryPassword(user.userRegistrationInfo.id, user.email);
    return Result.Ok();
  }

  private async updateRecoveryPassword(userInfoId: string, email: string) {
    const dataCode: Pick<
      UserRegistrationInfo,
      'recoveryCode' | 'expirationRecoveryCode'
    > = {
      recoveryCode: uuidv4(),
      expirationRecoveryCode: add(
        new Date(),
        this.userConfig.getRecoveryCodeLifetime(),
      ),
    };

    await this.userRepo.updateRegistrationInfo(userInfoId, {
      ...dataCode,
    });

    this.createEventRecoveryPassword(email, dataCode.recoveryCode);
  }

  private createEventRecoveryPassword(email: string, recoveryCode: string) {
    this.eventEmitter.emit(
      USER_RECOVERY_PASSWORD_EVENT_NAME,
      new UserRecoveryPasswordEvent(email, recoveryCode),
    );
  }
}
