import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PasswordRecoveryResendingDto } from '../../dto/passwordRecoveryResending.dto';
import {
  BadRequestError,
  Result,
  validateOrRejectModel,
} from '../../../../core';
import { UserRepository } from '../../db';
import { ERROR_INCORRECT_RECOVER_CODE } from '../../user.constants';
import { UserService } from '../../user.service';

export class PasswordRecoveryResendingCommand {
  constructor(public resendingDto: PasswordRecoveryResendingDto) {}
}

@CommandHandler(PasswordRecoveryResendingCommand)
export class PasswordRecoveryResendingUseCase
  implements ICommandHandler<PasswordRecoveryResendingCommand>
{
  constructor(
    private readonly userRepo: UserRepository,
    private readonly userService: UserService,
  ) {}

  async execute({
    resendingDto,
  }: PasswordRecoveryResendingCommand): Promise<Result> {
    await validateOrRejectModel(resendingDto, PasswordRecoveryResendingDto);

    const userInfo = await this.userRepo.findByRecoveryCode(resendingDto.code);

    if (!userInfo) {
      return Result.Err(
        new BadRequestError(ERROR_INCORRECT_RECOVER_CODE, 'code'),
      );
    }

    await this.userService.updateRecoveryPassword(
      userInfo.id,
      userInfo.user.email,
    );
    return Result.Ok();
  }
}
