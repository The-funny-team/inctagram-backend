import { Type } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';
import { CreateDeviceUseCase } from './createDevice.usecase';
import { CheckDeviceCredentialsUseCase } from './checkDeviceCredentials.usecase';
import { DeleteDeviceUseCase } from './deleteDevice.usecase';
import { RefreshTokenUseCase } from './refreshToken.usecase';

export * from './createDevice.usecase';
export * from './checkDeviceCredentials.usecase';
export * from './deleteDevice.usecase';
export * from './refreshToken.usecase';

export const DEVICES_USE_CASES: Type<ICommandHandler>[] = [
  CreateDeviceUseCase,
  CheckDeviceCredentialsUseCase,
  DeleteDeviceUseCase,
  RefreshTokenUseCase,
];
