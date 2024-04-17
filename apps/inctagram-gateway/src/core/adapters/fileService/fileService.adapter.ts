import {
  FileDeleteResponse,
  FileInfoResponse,
  FileUploadRequest,
  FileUploadResponse,
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
import {
  DELETE_FILE,
  DELETE_FILES,
  GET_FILES_INFO,
  UPDATE_OWNER_ID_FILE,
  UPLOAD_FILE,
} from '@libs/constants/microservice.constant';

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
        .send({ cmd: UPLOAD_FILE }, payload)
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
        .send({ cmd: DELETE_FILE }, { fileId })
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
        .send({ cmd: DELETE_FILES }, { fileIds })
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
        .send({ cmd: UPDATE_OWNER_ID_FILE }, { ids, ownerId })
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

  async getFilesInfo(ids: string[]): Promise<Result<FileInfoResponse[]>> {
    try {
      const responseOfService = this.fileServiceClient
        .send({ cmd: GET_FILES_INFO }, { ids })
        .pipe(timeout(10000));
      const response: FileInfoResponse[] = await firstValueFrom(
        responseOfService,
      );

      return Result.Ok(response);
    } catch (error) {
      this.logger.log(error);
      return Result.Err(new BadGatewayError(ERROR_GET_URLS_FILES));
    }
  }
}
