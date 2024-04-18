import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../db';
import { USER_NOT_FOUND } from '../../user.constants';
import { FileServiceAdapter, NotFoundError, Result } from '@gateway/src/core';
import { Logger } from '@nestjs/common';

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
    private readonly fileServiceAdapter: FileServiceAdapter,
  ) {}

  async execute({ userId }: DeleteAvatarUserCommand): Promise<Result> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      return Result.Err(new NotFoundError(USER_NOT_FOUND));
    }
    if (!user.avatarId) {
      return Result.Ok();
    }

    const deletionResult = await this.fileServiceAdapter.delete(user.avatarId);
    if (!deletionResult.isSuccess) {
      return Result.Err(deletionResult.err);
    }

    await this.userRepo.update(user.id, { avatarId: null });
    return Result.Ok();
  }
}
