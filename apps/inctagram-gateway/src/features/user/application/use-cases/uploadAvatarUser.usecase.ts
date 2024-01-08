import { AvatarUploadRequest, AvatarUploadResponse } from '@libs/contracts';
import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { UserRepository } from '../../db';
import { ImageInputDto } from '../../dto';
import {
  ERROR_INVALID_FILE_TYPE,
  ERROR_UPLOAD_FILE,
  USER_NOT_FOUND,
} from '../../user.constants';
import sharp from 'sharp';

import { firstValueFrom, timeout } from 'rxjs';
import {
  BadGatewayError,
  BadRequestError,
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
    @Inject('FILE_SERVICE') private readonly fileServiceClient: ClientProxy,
    private readonly userRepository: UserRepository,
  ) {}

  async execute({ data }: UploadAvatarUserCommand): Promise<Result> {
    const metadata = await sharp(data.buffer).metadata();
    const resultValidate = this.validateImage(metadata);
    if (!resultValidate.isSuccess) {
      return Result.Err(resultValidate.err);
    }

    const payload: AvatarUploadRequest = {
      userId: data.userId,
      originalname: data.originalname,
      buffer: data.buffer,
      format: metadata.format,
      fileType: FileType.Avatar,
    };

    let fileId: string;
    try {
      const responseOfService = this.fileServiceClient
        .send({ cmd: 'upload_avatar' }, payload)
        .pipe(timeout(10000));

      const resultResponse: AvatarUploadResponse = await firstValueFrom(
        responseOfService,
      );
      fileId = resultResponse.fileId;
    } catch (error) {
      this.logger.error(error);
      return Result.Err(new BadGatewayError(ERROR_UPLOAD_FILE));
    }

    if (!fileId) {
      return Result.Err(new BadGatewayError(ERROR_UPLOAD_FILE));
    }

    const updateResult = await this.userRepository
      .update(data.userId, { avatarId: fileId })
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
}
