import { CommandBus } from '@nestjs/cqrs';
import { CreateDeviceCommand } from './application';
import { Injectable } from '@nestjs/common';
import { DeviceDto } from './dto';
import { Result } from '../../core';
import { CreateTokensType } from './types/createTokens.type';

@Injectable()
export class DeviceFacade {
  constructor(
    private readonly commandBus: CommandBus, // private readonly deviceQueryRepo: DeviceQueryRepository,
  ) {}

  useCases = {
    createDevice: (deviceDto: DeviceDto): Promise<Result<CreateTokensType>> =>
      this.createDevice(deviceDto),
  };

  private async createDevice(
    deviceDto: DeviceDto,
  ): Promise<Result<CreateTokensType>> {
    return this.commandBus.execute<
      CreateDeviceCommand,
      Result<CreateTokensType>
    >(new CreateDeviceCommand(deviceDto));
  }
}
