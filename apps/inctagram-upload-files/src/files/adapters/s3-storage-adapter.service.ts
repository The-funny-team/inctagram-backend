import { Injectable, Logger } from '@nestjs/common';
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { FileUploadRequest } from '@libs/contracts';
import { AmazonCloudBacketConfig } from '../config/yandex-cloud-backet.configuration';
import { FileSaveResponse } from '../types/fileSave.response';
import { v4 as uuidv4 } from 'uuid';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';

@Injectable()
export class S3StorageAdapter {
  logger = new Logger(S3StorageAdapter.name);

  private s3Client: S3Client;
  private bucketName: string;
  private settings;

  constructor(private readonly yandexCloudConfig: AmazonCloudBacketConfig) {
    this.settings = yandexCloudConfig.getSettings();
    this.bucketName = this.settings.AMAZON_CLOUD_BUCKET_NAME;

    const REGION = 'eu-north-1';
    this.s3Client = new S3Client({
      region: REGION,
      endpoint: this.settings.AMAZON_CLOUD_URL,
      credentials: {
        secretAccessKey: this.settings.AMAZON_CLOUD_SECRET_KEY,
        accessKeyId: this.settings.AMAZON_CLOUD_KEY_ID,
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

    const bufferStream = new Readable();
    bufferStream.push(buffer.buffer);
    bufferStream.push(null); // End the stream
    const bucketParams = {
      Bucket: this.bucketName,
      Key: key,
      Body: bufferStream,
      ContentType: `image/${format}`,
    };

    try {
      const upload = new Upload({
        params: bucketParams,
        client: this.s3Client,
      });

      upload.on('httpUploadProgress', (progress) => {
        console.log(progress);
      });

      const result = await upload.done();
      return {
        url: key,
        fileId: result.ETag,
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
    return await this.s3Client.send(new DeleteObjectsCommand(bucketParams));
  }
  getUrlFile(url: string) {
    return `${this.settings.AMAZON_CLOUD_URL_FILES}/${url}`;
  }
}
