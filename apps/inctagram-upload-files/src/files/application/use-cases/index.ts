import { Type } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';
import { UploadFileUseCase } from './uploadFile.usecase';
import { DeleteFileUseCases } from './deleteFile.usecase';
import { DeleteFilesUseCase } from '@fileService/src/files/application/use-cases/deleteFiles.usecase';

export * from './uploadFile.usecase';
export * from './deleteFile.usecase';

export const FILES_USE_CASES: Type<ICommandHandler>[] = [
  UploadFileUseCase,
  DeleteFileUseCases,
  DeleteFilesUseCase,
];
