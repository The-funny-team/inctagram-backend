import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { FILES_USE_CASES } from './application';
import { S3StorageAdapter } from './adapters';
import { AmazonCloudBacketConfig } from './config/yandex-cloud-backet.configuration';
import { FileRepository } from './db/file.repository';
import { FilesService } from './files.service';
import { MongooseModule } from '@nestjs/mongoose';
import { File, FileSchema } from './models/file.model';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
  ],
  controllers: [FilesController],
  providers: [
    S3StorageAdapter,
    ...FILES_USE_CASES,
    AmazonCloudBacketConfig,
    FileRepository,
    FilesService,
  ],
})
export class FilesModule {}
