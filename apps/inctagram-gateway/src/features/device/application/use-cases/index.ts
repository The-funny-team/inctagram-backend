import { Type } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';
import { CreateDeviceUseCase } from './createDevice.usecase';
import { CheckDeviceCredentialsUseCase } from './checkDeviceCredentials.usecase';
import { DeleteDeviceUseCase } from './deleteDevice.usecase';

export * from './createDevice.usecase';
export * from './checkDeviceCredentials.usecase';
export * from './deleteDevice.usecase';

export const DEVICES_USE_CASES: Type<ICommandHandler>[] = [
  CreateDeviceUseCase,
  CheckDeviceCredentialsUseCase,
  DeleteDeviceUseCase,
];
