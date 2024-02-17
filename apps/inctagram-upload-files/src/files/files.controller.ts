import {
  FileDeleteRequest,
  FileDeleteResponse,
  FileUpdateOwnerIdRequest,
  FileUpdateOwnerIdResponse,
  FileUploadRequest,
  FileUploadResponse,
  FileUrlRequest,
  FileUrlResponse,
  FilesUrlRequest,
  FilesUrlResponse,
} from '@libs/contracts';
import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern } from '@nestjs/microservices';
import { DeleteFileCommand, UploadFileCommand } from './application';
import { FilesService } from './files.service';
import { DeleteFilesCommand } from '@fileService/src/files/application/use-cases/deleteFiles.usecase';
import { FilesDeleteRequest } from '@libs/contracts/user/avatar/filesDeleteRequest.dto';

@Controller('files')
export class FilesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly filesService: FilesService,
  ) {}

  @MessagePattern({ cmd: 'upload_file' })
  async uploadFile(payload: FileUploadRequest): Promise<FileUploadResponse> {
    return this.commandBus.execute<UploadFileCommand, FileUploadResponse>(
      new UploadFileCommand(payload),
    );
  }

  @MessagePattern({ cmd: 'delete_file' })
  async deleteFile({ fileId }: FileDeleteRequest): Promise<FileDeleteResponse> {
    return this.commandBus.execute<DeleteFileCommand, FileDeleteResponse>(
      new DeleteFileCommand(fileId),
    );
  }

  @MessagePattern({ cmd: 'delete_files' })
  async deleteFiles({
    fileIds,
  }: FilesDeleteRequest): Promise<FileDeleteResponse> {
    return this.commandBus.execute<DeleteFilesCommand, FileDeleteResponse>(
      new DeleteFilesCommand(fileIds),
    );
  }

  @MessagePattern({ cmd: 'get_file_url' })
  async getFileInfo({ fileId }: FileUrlRequest): Promise<FileUrlResponse> {
    return this.filesService.getFileUrl(fileId);
  }

  @MessagePattern({ cmd: 'get_files_url' })
  async getFilesInfo({ ids }: FilesUrlRequest): Promise<FilesUrlResponse> {
    return this.filesService.getFilesUrl(ids);
  }

  @MessagePattern({ cmd: 'update_owner_id_file' })
  async updateOwnerIdFile(
    updateDto: FileUpdateOwnerIdRequest,
  ): Promise<FileUpdateOwnerIdResponse> {
    return this.filesService.updateOwnerIdFile(updateDto);
  }
}
