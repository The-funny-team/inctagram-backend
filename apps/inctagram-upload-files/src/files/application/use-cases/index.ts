import { Type } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';
import { UploadAvatarUseCase } from './uploadAvatar.usecase';
import { DeleteAvatarUseCases } from './deleteAvatar.usecase';

export * from './uploadAvatar.usecase';
export * from './deleteAvatar.usecase';

export const FILES_USE_CASES: Type<ICommandHandler>[] = [
  UploadAvatarUseCase,
  DeleteAvatarUseCases,
];
