import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestError,
  Result,
  validateOrRejectModel,
} from '../../../../core';
import { UserRepository } from '../../db';
import { ERROR_INCORRECT_CONFIRMATION_CODE } from '../../user.constants';
import { UserService } from '../../user.service';
import { RegistrationEmailResendingDto } from '../../dto';

export class RegistrationEmailResendingCommand {
  constructor(public resendingDto: RegistrationEmailResendingDto) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase
  implements ICommandHandler<RegistrationEmailResendingCommand>
{
  constructor(
    private readonly userRepo: UserRepository,
    private readonly userService: UserService,
  ) {}

  async execute({
    resendingDto,
  }: RegistrationEmailResendingCommand): Promise<Result> {
    await validateOrRejectModel(resendingDto, RegistrationEmailResendingDto);

    const userInfo = await this.userRepo.findByCodeConfirmation(
      resendingDto.code,
    );

    if (!userInfo) {
      return Result.Err(
        new BadRequestError(ERROR_INCORRECT_CONFIRMATION_CODE, 'code'),
      );
    }

    await this.userService.updateConfirmationCode(
      userInfo.id,
      userInfo.user.email,
    );
    return Result.Ok();
  }
}
