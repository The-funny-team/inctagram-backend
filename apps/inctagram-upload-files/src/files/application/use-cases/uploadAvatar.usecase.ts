import { AvatarUploadRequest, AvatarUploadResponse } from '@libs/contracts';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { S3StorageAdapter } from '../../adapters';
import { FileRepository } from '../../db/file.repository';
import { FileEntity } from '../../entities/file.entity';
import { IFile } from '../../interface/file.interface';
import { FileSaveResponse } from '../../types/fileSave.response';
import { ERROR_FILE_NOT_FOUND } from '../../constants/fileError.constant';

export class UploadAvatarCommand {
  constructor(public payload: AvatarUploadRequest) {}
}

@CommandHandler(UploadAvatarCommand)
export class UploadAvatarUseCase
  implements ICommandHandler<UploadAvatarCommand>
{
  constructor(
    private readonly fileStorageAdapter: S3StorageAdapter,
    private readonly fileRepo: FileRepository,
  ) {}

  async execute({
    payload,
  }: UploadAvatarCommand): Promise<AvatarUploadResponse> {
    const downloadFile = await this.fileStorageAdapter.saveAvatar(payload);

    // TODO добавить проверку валидации полей payload

    let file: IFile;
    if (payload.id) {
      file = await this.updateFile(payload, downloadFile);
    } else {
      file = await this.createFile(payload, downloadFile);
    }

    return { fileId: file._id };
  }

  private async createFile(
    payload: AvatarUploadRequest,
    downloadFile: FileSaveResponse,
  ) {
    const file = {
      userId: payload.userId,
      fileType: payload.fileType,
      originalname: payload.originalname,
      format: payload.format,
      url: downloadFile.url,
      fileId: downloadFile.fileId,
    };

    const fileEntity = new FileEntity(file);
    return this.fileRepo.createFile(fileEntity);
  }

  private async updateFile(
    payload: AvatarUploadRequest,
    downloadFile: FileSaveResponse,
  ) {
    const existedFile = await this.fileRepo.findFileById(payload.id);
    if (!existedFile) {
      throw new Error(ERROR_FILE_NOT_FOUND);
    }

    const fileEntity = new FileEntity(existedFile).updateFileInfo(downloadFile);
    await this.fileRepo.updateFile(fileEntity);
    return existedFile;
  }
}
