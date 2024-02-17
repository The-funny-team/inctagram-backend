import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserPasswordRecoveryDto } from '../../dto';
import { validateOrRejectModel } from '../../../../core/config';
import { Result } from '../../../../core/result';
import { UserRepository } from '../../db';
import { BadRequestError } from '../../../../core/exceptions';
import { ERROR_USER_WITH_THIS_EMAIL_NOT_EXIST } from '../../user.constants';
import { UserService } from '../../user.service';

export class UserPasswordRecoveryCommand {
  constructor(public passwordRecoveryDto: UserPasswordRecoveryDto) {}
}

@CommandHandler(UserPasswordRecoveryCommand)
export class UserPasswordRecoveryUseCase
  implements ICommandHandler<UserPasswordRecoveryCommand>
{
  constructor(
    private readonly userRepo: UserRepository,
    private readonly userService: UserService,
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

    await this.userService.updateRecoveryPassword(
      user.userRegistrationInfo.id,
      user.email,
    );
    return Result.Ok();
  }
}
