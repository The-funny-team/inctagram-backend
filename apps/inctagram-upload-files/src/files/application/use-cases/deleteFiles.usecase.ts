import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { S3StorageAdapter } from '../../adapters';
import { FileRepository } from '../../db/file.repository';
import { FileDeleteResponse } from '@libs/contracts';

export class DeleteFilesCommand {
  constructor(public fileIds: string[]) {}
}

@CommandHandler(DeleteFilesCommand)
export class DeleteFilesUseCases
  implements ICommandHandler<DeleteFilesCommand>
{
  constructor(
    private readonly fileStorageAdapter: S3StorageAdapter,
    private readonly fileRepo: FileRepository,
  ) {}

  async execute({ fileIds }: DeleteFilesCommand): Promise<FileDeleteResponse> {
    const result = { isSuccess: true };
    const files = await this.fileRepo.findFilesByIds(fileIds);
    if (!files.length) {
      result.isSuccess = false;
      return result;
    }

    const urls = files.map((file) =>
      this.fileStorageAdapter.getUrlFile(file.url),
    );

    //TODO: Need transaction here. How to make s3 api transaction
    await this.fileStorageAdapter.deleteImages(urls);
    await this.fileRepo.deleteFiles(fileIds);

    return result;
  }
}
