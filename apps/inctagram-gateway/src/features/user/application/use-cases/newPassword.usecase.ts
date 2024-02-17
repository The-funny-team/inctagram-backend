import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NewPasswordDto } from '../../dto';
import { validateOrRejectModel } from '../../../../core/config';
import { Result } from '../../../../core/result';
import { BadRequestError } from '../../../../core/exceptions';
import { ERROR_INCORRECT_RECOVER_CODE } from '../../user.constants';
import { UserService } from '../../user.service';
import { UserRepository } from '../../db';
import { User } from '@prisma/client';

export class NewPasswordCommand {
  constructor(public dto: NewPasswordDto) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase implements ICommandHandler<NewPasswordCommand> {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly userService: UserService,
  ) {}

  async execute({ dto }: NewPasswordCommand): Promise<Result<User>> {
    await validateOrRejectModel(dto, NewPasswordDto);

    const userInfo = await this.userRepo.findByRecoveryCode(dto.recoveryCode);

    if (!userInfo || userInfo.expirationRecoveryCode < new Date()) {
      return Result.Err(
        new BadRequestError(ERROR_INCORRECT_RECOVER_CODE, 'recoveryCode'),
      );
    }

    const newHashPassword = this.userService.generatePasswordHash(dto.password);
    const updatedUser = await this.userRepo.update(userInfo.userId, {
      hashPassword: newHashPassword,
    });

    return Result.Ok(updatedUser);
  }
}
