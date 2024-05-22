import { BadRequestError, FileServiceAdapter, Result } from '@gateway/src/core';
import { ImageInputDto } from '@gateway/src/features/user/dto';
import { FileUploadRequest, FileUploadResponse } from '@libs/contracts';
import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import sharp from 'sharp';
import { ERROR_INVALID_IMAGE_FILE_TYPE } from '../../post.constants';
import { FileType } from '@libs/types/fileType.enum';

export class UploadImagePostCommand {
  constructor(public imageDto: ImageInputDto) {}
}

@CommandHandler(UploadImagePostCommand)
export class UploadImagePostUseCase
  implements ICommandHandler<UploadImagePostCommand>
{
  logger = new Logger(UploadImagePostUseCase.name);

  constructor(private readonly fileServiceAdapter: FileServiceAdapter) {}

  async execute({
    imageDto,
  }: UploadImagePostCommand): Promise<Result<FileUploadResponse>> {
    const metadata = await sharp(imageDto.buffer).metadata();
    const resultValidate = this.validateImage(metadata);
    if (!resultValidate.isSuccess) {
      return Result.Err(resultValidate.err);
    }

    const payload = this.getPayload(imageDto, metadata);
    return this.fileServiceAdapter.upload(payload);
  }

  private validateImage(metadata: sharp.Metadata) {
    const availableFileTypes = ['png', 'jpeg'];
    if (!availableFileTypes.includes(metadata.format!)) {
      return Result.Err(
        new BadRequestError(ERROR_INVALID_IMAGE_FILE_TYPE, 'image'),
      );
    }
    return Result.Ok();
  }

  private getPayload(
    imageDto: ImageInputDto,
    metadata: sharp.Metadata,
  ): FileUploadRequest {
    return {
      userId: imageDto.userId,
      originalname: imageDto.originalname,
      buffer: imageDto.buffer,
      format: metadata.format,
      fileType: FileType.PostImage,
    };
  }
}
