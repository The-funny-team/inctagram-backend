import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserService } from '../../user.service';
import { UserRepository } from '../../db';
import { UserId } from '../../types';
import { Result, UnauthorizedError } from '../../../../core';
import {
  ERROR_PASSWORD_IS_WRONG,
  ERROR_USER_NOT_CONFIRMED,
  USER_NOT_FOUND,
} from '../../user.constants';
import { LoginDto } from '../../../auth/dto/login.dto';

export class CheckUserCredentialsCommand {
  constructor(public loginDto: LoginDto) {}
}

@CommandHandler(CheckUserCredentialsCommand)
export class CheckUserCredentialsUseCase
  implements ICommandHandler<CheckUserCredentialsCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userService: UserService,
  ) {}

  async execute({
    loginDto,
  }: CheckUserCredentialsCommand): Promise<Result<UserId>> {
    const user = await this.userRepository.findByEmail(loginDto.email);

    if (!user) return Result.Err(new UnauthorizedError(USER_NOT_FOUND));

    const isMatched = this.userService.isCorrectPassword(
      loginDto.password,
      user.hashPassword,
    );
    if (!isMatched)
      return Result.Err(new UnauthorizedError(ERROR_PASSWORD_IS_WRONG));

    if (!user.userRegistrationInfo.isConfirmed)
      return Result.Err(new UnauthorizedError(ERROR_USER_NOT_CONFIRMED));

    return Result.Ok({ userId: user.id });
  }
}
