import {
  FileDeleteResponse,
  FileUploadRequest,
  FileUploadResponse,
  FilesUrlResponse,
} from '@libs/contracts';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Result } from '../../result';
import { firstValueFrom, timeout } from 'rxjs';
import { BadGatewayError } from '../../exceptions';
import {
  ERROR_DELETE_FILE,
  ERROR_GET_URLS_FILES,
  ERROR_UPDATE_OWNWER_ID_FILE,
  ERROR_UPLOAD_FILE,
} from './fileService.constants';

@Injectable()
export class FileServiceAdapter {
  logger = new Logger(FileServiceAdapter.name);

  constructor(
    @Inject('FILE_SERVICE') private readonly fileServiceClient: ClientProxy,
  ) {}

  async upload(
    payload: FileUploadRequest,
  ): Promise<Result<FileUploadResponse>> {
    try {
      const responseOfService = this.fileServiceClient
        .send({ cmd: 'upload_file' }, payload)
        .pipe(timeout(10000));

      const resultResponse: FileUploadResponse = await firstValueFrom(
        responseOfService,
      );
      return Result.Ok(resultResponse);
    } catch (error) {
      this.logger.error(error);
      return Result.Err(new BadGatewayError(ERROR_UPLOAD_FILE));
    }
  }

  async delete(fileId: string): Promise<Result<FileDeleteResponse>> {
    try {
      const responseOfService = this.fileServiceClient
        .send({ cmd: 'delete_file' }, { fileId })
        .pipe(timeout(10000));
      const deletionResult = await firstValueFrom(responseOfService);
      return Result.Ok<FileDeleteResponse>(deletionResult);
    } catch (error) {
      this.logger.error(error);
      return Result.Err(new BadGatewayError(ERROR_DELETE_FILE));
    }
  }
  async deleteFiles(fileIds: string[]): Promise<Result<FileDeleteResponse>> {
    try {
      const responseOfService = this.fileServiceClient
        .send({ cmd: 'delete_files' }, { fileIds })
        .pipe(timeout(10000));
      const deletionResult = await firstValueFrom(responseOfService);
      return Result.Ok<FileDeleteResponse>(deletionResult);
    } catch (error) {
      this.logger.error(error);
      return Result.Err(new BadGatewayError(ERROR_DELETE_FILE));
    }
  }

  async updateOwnerId(ids: string[], ownerId: string): Promise<Result> {
    try {
      const responseOfService = this.fileServiceClient
        .send({ cmd: 'update_owner_id_file' }, { ids, ownerId })
        .pipe(timeout(10000));

      const updateResult = await firstValueFrom(responseOfService);
      if (!updateResult.isSuccess) {
        return Result.Err(new BadGatewayError(ERROR_UPDATE_OWNWER_ID_FILE));
      }

      return Result.Ok();
    } catch (error) {
      this.logger.error(error);
      return Result.Err(new BadGatewayError(ERROR_UPDATE_OWNWER_ID_FILE));
    }
  }

  async getFilesInfo(ids: string[]): Promise<Result<FilesUrlResponse>> {
    try {
      const responseOfService = this.fileServiceClient
        .send({ cmd: 'get_files_url' }, { ids })
        .pipe(timeout(10000));
      const response: FilesUrlResponse = await firstValueFrom(
        responseOfService,
      );

      return Result.Ok(response);
    } catch (error) {
      this.logger.log(error);
      return Result.Err(new BadGatewayError(ERROR_GET_URLS_FILES));
    }
  }
}
