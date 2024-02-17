import { Injectable } from '@nestjs/common';
import { S3StorageAdapter } from './adapters';
import {
  FileUpdateOwnerIdRequest,
  FileUpdateOwnerIdResponse,
  FileUrlResponse,
  FilesUrlResponse,
} from '@libs/contracts';
import { FileRepository } from './db/file.repository';
import {
  ERROR_FILES_NOT_FOUND,
  ERROR_FILE_NOT_FOUND,
} from './constants/fileError.constant';

@Injectable()
export class FilesService {
  constructor(
    private readonly fileStorageAdapter: S3StorageAdapter,
    private readonly fileRepo: FileRepository,
  ) {}

  async getFileUrl(fileId: string): Promise<FileUrlResponse> {
    const file = await this.fileRepo.findFileById(fileId);
    if (!file) {
      throw new Error(ERROR_FILE_NOT_FOUND);
    }

    return { url: this.fileStorageAdapter.getUrlFile(file.url) };
  }

  async updateOwnerIdFile({
    ids,
    ownerId,
  }: FileUpdateOwnerIdRequest): Promise<FileUpdateOwnerIdResponse> {
    await this.fileRepo.updateOwnerId(ids, ownerId);
    return { isSuccess: true };
  }

  async getFilesUrl(ids: string[]): Promise<FilesUrlResponse> {
    const files = await this.fileRepo.findFilesByIds(ids);
    if (!files.length) {
      throw new Error(ERROR_FILES_NOT_FOUND);
    }

    return {
      urls: files.map((file) => this.fileStorageAdapter.getUrlFile(file.url)),
    };
  }
}
