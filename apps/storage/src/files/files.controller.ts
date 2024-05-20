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
  FileInfoResponse,
} from '@libs/contracts';
import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern } from '@nestjs/microservices';
import { DeleteFileCommand, UploadFileCommand } from './application';
import { FilesService } from './files.service';
import { DeleteFilesCommand } from './application/use-cases/deleteFiles.usecase';
import { FilesDeleteRequest } from '@libs/contracts/user/avatar/filesDeleteRequest.dto';
import {
  DELETE_FILE,
  DELETE_FILES,
  GET_FILE_URL,
  GET_FILES_INFO,
  UPDATE_OWNER_ID_FILE,
  UPLOAD_FILE,
} from '@libs/constants/microservice.constant';

@Controller('files')
export class FilesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly filesService: FilesService,
  ) {}

  @MessagePattern({ cmd: UPLOAD_FILE })
  async uploadFile(payload: FileUploadRequest): Promise<FileUploadResponse> {
    return this.commandBus.execute<UploadFileCommand, FileUploadResponse>(
      new UploadFileCommand(payload),
    );
  }

  @MessagePattern({ cmd: DELETE_FILE })
  async deleteFile({ fileId }: FileDeleteRequest): Promise<FileDeleteResponse> {
    return this.commandBus.execute<DeleteFileCommand, FileDeleteResponse>(
      new DeleteFileCommand(fileId),
    );
  }

  @MessagePattern({ cmd: DELETE_FILES })
  async deleteFiles({
    fileIds,
  }: FilesDeleteRequest): Promise<FileDeleteResponse> {
    return this.commandBus.execute<DeleteFilesCommand, FileDeleteResponse>(
      new DeleteFilesCommand(fileIds),
    );
  }

  @MessagePattern({ cmd: GET_FILE_URL })
  async getFileInfo({ fileId }: FileUrlRequest): Promise<FileUrlResponse> {
    return this.filesService.getFileUrl(fileId);
  }

  @MessagePattern({ cmd: GET_FILES_INFO })
  async getFilesInfo({ ids }: FilesUrlRequest): Promise<FileInfoResponse[]> {
    return this.filesService.getFilesInfo(ids);
  }

  @MessagePattern({ cmd: UPDATE_OWNER_ID_FILE })
  async updateOwnerIdFile(
    updateDto: FileUpdateOwnerIdRequest,
  ): Promise<FileUpdateOwnerIdResponse> {
    return this.filesService.updateOwnerIdFile(updateDto);
  }
}
