import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { S3StorageAdapter } from '../../adapters';
import { FileRepository } from '../../db/file.repository';
import { FileDeleteResponse } from '@libs/contracts';

export class DeleteFileCommand {
  constructor(public fileId: string) {}
}

@CommandHandler(DeleteFileCommand)
export class DeleteFileUseCases implements ICommandHandler<DeleteFileCommand> {
  constructor(
    private readonly fileStorageAdapter: S3StorageAdapter,
    private readonly fileRepo: FileRepository,
  ) {}

  async execute({ fileId }: DeleteFileCommand): Promise<FileDeleteResponse> {
    const result = { isSuccess: true };
    const file = await this.fileRepo.findFileById(fileId);
    if (!file) {
      result.isSuccess = false;
      return result;
    }

    await this.fileStorageAdapter.deleteAvatar(file.url);
    await this.fileRepo.deleteFile(file._id);

    return result;
  }
}
