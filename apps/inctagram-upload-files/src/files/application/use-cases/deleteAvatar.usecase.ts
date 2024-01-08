import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { S3StorageAdapter } from '../../adapters';
import { FileRepository } from '../../db/file.repository';
import { AvatarDeleteResponse } from '@libs/contracts';
import { Logger } from '@nestjs/common';

export class DeleteAvatarCommand {
  constructor(public fileId: string) {}
}

@CommandHandler(DeleteAvatarCommand)
export class DeleteAvatarUseCases
  implements ICommandHandler<DeleteAvatarCommand>
{
  constructor(
    private readonly fileStorageAdapter: S3StorageAdapter,
    private readonly fileRepo: FileRepository,
  ) {}

  async execute({
    fileId,
  }: DeleteAvatarCommand): Promise<AvatarDeleteResponse> {
    const result = { isSuccess: true };
    const file = await this.fileRepo.findFileById(fileId);
    if (!file) {
      return result;
    }

    await this.fileStorageAdapter.deleteAvatar(file.url);
    await this.fileRepo.deleteFile(file._id);

    return result;
  }
}
