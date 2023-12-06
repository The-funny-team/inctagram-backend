import { CommandBus } from '@nestjs/cqrs';
import { CreateDeviceCommand } from './application';
import { Injectable } from '@nestjs/common';
import { DeviceDto } from './dto';
import { Result } from '../../core';
import { CreateTokensType } from './types/createTokens.type';
import { DeviceRepository } from './db';

@Injectable()
export class DeviceFacade {
  constructor(
    private readonly commandBus: CommandBus, // private readonly deviceQueryRepo: DeviceQueryRepository,
    private readonly deviceRepo: DeviceRepository,
  ) {}

  useCases = {
    createDevice: (deviceDto: DeviceDto): Promise<Result<CreateTokensType>> =>
      this.createDevice(deviceDto),
  };

  repository = {
    deleteDevicesByUserId: (userId: string): Promise<void> =>
      this.deleteDevicesByUserId(userId),
  };

  private async createDevice(
    deviceDto: DeviceDto,
  ): Promise<Result<CreateTokensType>> {
    return this.commandBus.execute<
      CreateDeviceCommand,
      Result<CreateTokensType>
    >(new CreateDeviceCommand(deviceDto));
  }

  private async deleteDevicesByUserId(userId: string): Promise<void> {
    await this.deviceRepo.deleteDevicesByUserId(userId);
  }
}
