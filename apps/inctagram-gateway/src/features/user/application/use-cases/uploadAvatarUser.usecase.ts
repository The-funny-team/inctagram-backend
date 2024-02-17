import { FileUploadRequest } from '@libs/contracts';
import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../db';
import { ImageInputDto } from '../../dto';
import { ERROR_INVALID_FILE_TYPE, USER_NOT_FOUND } from '../../user.constants';
import sharp from 'sharp';
import {
  BadRequestError,
  FileServiceAdapter,
  NotFoundError,
  Result,
} from '@gateway/src/core';
import { FileType } from '@libs/types/fileType.enum';

export class UploadAvatarUserCommand {
  constructor(public data: ImageInputDto) {}
}

@CommandHandler(UploadAvatarUserCommand)
export class UploadAvatarUserUseCase
  implements ICommandHandler<UploadAvatarUserCommand>
{
  logger = new Logger(UploadAvatarUserUseCase.name);

  constructor(
    private readonly fileServiceAdapter: FileServiceAdapter,
    private readonly userRepository: UserRepository,
  ) {}

  async execute({ data }: UploadAvatarUserCommand): Promise<Result> {
    const metadata = await sharp(data.buffer).metadata();
    const resultValidate = this.validateImage(metadata);
    if (!resultValidate.isSuccess) {
      return Result.Err(resultValidate.err);
    }

    const payload = this.getPayload(data, metadata);

    const downloadResult = await this.fileServiceAdapter.upload(payload);
    if (!downloadResult.isSuccess) {
      return Result.Err(downloadResult.err);
    }

    const updateResult = await this.userRepository
      .update(data.userId, { avatarId: downloadResult.value.fileId })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
    if (!updateResult) {
      return Result.Err(new NotFoundError(USER_NOT_FOUND));
    }

    return Result.Ok();
  }

  private validateImage(metadata: sharp.Metadata) {
    const availableFileTypes = ['png', 'jpeg'];
    if (!availableFileTypes.includes(metadata.format!)) {
      return Result.Err(new BadRequestError(ERROR_INVALID_FILE_TYPE, 'file'));
    }
    return Result.Ok();
  }

  private getPayload(
    data: ImageInputDto,
    metadata: sharp.Metadata,
  ): FileUploadRequest {
    return {
      userId: data.userId,
      originalname: data.originalname,
      buffer: data.buffer,
      format: metadata.format,
      fileType: FileType.Avatar,
      ownerId: data.userId,
    };
  }
}
