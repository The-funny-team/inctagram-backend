import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../core/result';
import { BadRequestError } from '../../../../core/exceptions';
import { ERROR_INCORRECT_CONFIRMATION_CODE } from '../../user.constants';
import { ConfirmationCodeDto } from '../../../auth/dto';
import { validateOrRejectModel } from '../../../../core/config';
import { UserRepository } from '../../db';

export class ConfirmationRegistrationCommand {
  constructor(public confirmDto: ConfirmationCodeDto) {}
}

@CommandHandler(ConfirmationRegistrationCommand)
export class ConfirmationRegistrationUseCase
  implements ICommandHandler<ConfirmationRegistrationCommand>
{
  constructor(private readonly userRepo: UserRepository) {}
  async execute({
    confirmDto,
  }: ConfirmationRegistrationCommand): Promise<Result<boolean>> {
    await validateOrRejectModel(confirmDto, ConfirmationCodeDto);

    const userInfo = await this.userRepo.findByCodeConfirmation(
      confirmDto.code,
    );

    if (userInfo && userInfo.isConfirmed) {
      return Result.Ok(true);
    }

    if (!userInfo || userInfo.expirationConfirmationCode < new Date()) {
      return Result.Err(
        new BadRequestError(ERROR_INCORRECT_CONFIRMATION_CODE, 'code'),
      );
    }

    userInfo.isConfirmed = true;
    await this.userRepo.updateRegistrationInfo(userInfo.id, {
      isConfirmed: true,
    });

    return Result.Ok(true);
  }
}
