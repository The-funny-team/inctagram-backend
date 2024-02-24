import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { S3StorageAdapter } from '../../adapters';
import { FileRepository } from '../../db/file.repository';
import { FileDeleteResponse } from '@libs/contracts';
import { InjectModel } from '@nestjs/mongoose';
import { File } from '@fileService/src/files/models/file.model';
import { Model } from 'mongoose';

export class DeleteFilesCommand {
  constructor(public fileIds: string[]) {}
}

@CommandHandler(DeleteFilesCommand)
export class DeleteFilesUseCase implements ICommandHandler<DeleteFilesCommand> {
  constructor(
    private readonly fileStorageAdapter: S3StorageAdapter,
    private readonly fileRepo: FileRepository,
    @InjectModel(File.name) private readonly fileModel: Model<File>,
  ) {}

  async execute({ fileIds }: DeleteFilesCommand): Promise<FileDeleteResponse> {
    const result = { isSuccess: true };
    const files = await this.fileRepo.findFilesByIds(fileIds);
    if (!files || !files.length) {
      result.isSuccess = false;
      return result;
    }

    const urls = files.map((file) => {
      return file.url;
    });

    const session = await this.fileModel.db.startSession();
    session.startTransaction();
    try {
      await this.fileModel.deleteMany({ _id: { $in: fileIds } });

      // Attempt to delete image from S3
      await this.fileStorageAdapter.deleteImages(urls);

      // If both operations are successful, commit the transaction
      await session.commitTransaction();
    } catch (error) {
      // If any operation fails, rollback the transaction
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
    return result;
  }
}
