import {
  AvatarDeleteRequest,
  AvatarDeleteResponse,
  AvatarUploadRequest,
  AvatarUploadResponse,
  FileUrlRequest,
  FileUrlResponse,
} from '@libs/contracts';
import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern } from '@nestjs/microservices';
import { DeleteAvatarCommand, UploadAvatarCommand } from './application';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly filesService: FilesService,
  ) {}

  @MessagePattern({ cmd: 'upload_avatar' })
  async uploadAvatar(
    payload: AvatarUploadRequest,
  ): Promise<AvatarUploadResponse> {
    return this.commandBus.execute<UploadAvatarCommand, AvatarUploadResponse>(
      new UploadAvatarCommand(payload),
    );
  }

  @MessagePattern({ cmd: 'delete_avatar' })
  async deleteAvatar({
    fileId,
  }: AvatarDeleteRequest): Promise<AvatarDeleteResponse> {
    return this.commandBus.execute<DeleteAvatarCommand, AvatarDeleteResponse>(
      new DeleteAvatarCommand(fileId),
    );
  }

  @MessagePattern({ cmd: 'get_file_url' })
  async getFileInfo({ fileId }: FileUrlRequest): Promise<FileUrlResponse> {
    return this.filesService.getFileUrl(fileId);
  }
}
