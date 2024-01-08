import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserRepository } from '../../db';
import { ERROR_DELETE_FILE, USER_NOT_FOUND } from '../../user.constants';
import { Observable, firstValueFrom, timeout } from 'rxjs';
import { Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AvatarDeleteResponse } from '@libs/contracts';
import { BadGatewayError, NotFoundError, Result } from '@gateway/src/core';

export class DeleteAvatarUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteAvatarUserCommand)
export class DeleteAvatarUserUseCase
  implements ICommandHandler<DeleteAvatarUserCommand>
{
  logger = new Logger(DeleteAvatarUserUseCase.name);

  constructor(
    private readonly userRepo: UserRepository,
    @Inject('FILE_SERVICE') private readonly fileServiceClient: ClientProxy,
  ) {}

  async execute({ userId }: DeleteAvatarUserCommand): Promise<Result> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      return Result.Err(new NotFoundError(USER_NOT_FOUND));
    }

    if (!user.avatarId) {
      return Result.Ok();
    }

    let isSuccess = false;

    try {
      const responseOfService = this.fileServiceClient
        .send({ cmd: 'delete_avatar' }, { fileId: user.avatarId })
        .pipe(timeout(10000));
      const deletionResult = await firstValueFrom(responseOfService);
      isSuccess = deletionResult.isSuccess;
    } catch (error) {
      this.logger.error(error);
      return Result.Err(new BadGatewayError(ERROR_DELETE_FILE));
    }

    if (!isSuccess) {
      return Result.Err(new BadGatewayError(ERROR_DELETE_FILE));
    }

    await this.userRepo.update(user.id, { avatarId: null });
    return Result.Ok();
  }
}
