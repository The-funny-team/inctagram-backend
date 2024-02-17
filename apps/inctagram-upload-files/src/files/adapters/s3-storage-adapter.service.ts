import { Injectable, Logger } from '@nestjs/common';
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { FileUploadRequest } from '@libs/contracts';
import { YandexCloudBacketConfig } from '../config/yandex-cloud-backet.configuration';
import { FileSaveResponse } from '../types/fileSave.response';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3StorageAdapter {
  logger = new Logger(S3StorageAdapter.name);

  private s3Client: S3Client;
  private bucketName: string;
  private settings;

  constructor(private readonly yandexCloudConfig: YandexCloudBacketConfig) {
    this.settings = yandexCloudConfig.getSettings();
    this.bucketName = this.settings.YANDEX_CLOUD_BUCKET_NAME;

    const REGION = 'ru-central1';
    this.s3Client = new S3Client({
      region: REGION,
      endpoint: this.settings.YANDEX_CLOUD_URL,
      credentials: {
        secretAccessKey: this.settings.YANDEX_CLOUD_SECRET_KEY,
        accessKeyId: this.settings.YANDEX_CLOUD_KEY_ID,
      },
    });
  }

  async saveAvatar({
    userId,
    buffer,
    format,
    fileType,
  }: FileUploadRequest): Promise<FileSaveResponse> {
    const key = `content/${userId}/${fileType}/${uuidv4()}.${format}`;
    const bucketParams = {
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: `image/${format}`,
    };

    const command = new PutObjectCommand(bucketParams);

    try {
      const uploadResult = await this.s3Client.send(command);

      return {
        url: key,
        fileId: uploadResult.ETag,
      };
    } catch (exception) {
      this.logger.error(exception);
      throw exception;
    }
  }

  async deleteAvatar(key: string) {
    const bucketParams = { Bucket: this.bucketName, Key: key };
    try {
      const data = await this.s3Client.send(
        new DeleteObjectCommand(bucketParams),
      );
      return data;
    } catch (exception) {
      this.logger.error(exception);
      throw exception;
    }
  }

  async deleteImages(keys: string[]) {
    const objectsToDelete = keys.map((key) => ({ Key: key }));

    const bucketParams = {
      Bucket: this.bucketName,
      Delete: { Objects: objectsToDelete },
      Quiet: false,
    };
    try {
      return await this.s3Client.send(new DeleteObjectsCommand(bucketParams));
    } catch (exception) {
      this.logger.error(exception);
      throw exception;
    }
  }
  getUrlFile(url: string) {
    return `${this.settings.YANDEX_CLOUD_URL_FILES}/${url}`;
  }
}
