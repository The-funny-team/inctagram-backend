import { Injectable } from '@nestjs/common';
import { S3StorageAdapter } from './adapters';
import { FileUrlResponse } from '@libs/contracts';
import { FileRepository } from './db/file.repository';
import { ERROR_FILE_NOT_FOUND } from './constants/fileError.constant';

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
}
