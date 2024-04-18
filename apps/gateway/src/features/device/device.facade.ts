import { CommandBus } from '@nestjs/cqrs';
import {
  CheckDeviceCredentialsCommand,
  CreateDeviceCommand,
  DeleteDeviceCommand,
} from './application';
import { Injectable } from '@nestjs/common';
import { DeviceDto } from './dto';
import { Result } from '../../core';
import { CreateTokensType } from './types/createTokens.type';
import { DeviceInfo } from './types/deviceInfo.type';
import { UserId } from '../user/types';
import { DeviceRepository } from './db';
import { RefreshTokenCommand } from '@gateway/src/features/device/application/use-cases/refreshToken.usecase';

@Injectable()
export class DeviceFacade {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly deviceRepo: DeviceRepository,
  ) {}

  useCases = {
    createDevice: (deviceDto: DeviceDto): Promise<Result<CreateTokensType>> =>
      this.createDevice(deviceDto),

    refreshToken: (
      ip: string,
      title: string,
      userId: string,
      deviceId: string,
    ) => this.refreshToken(ip, title, userId, deviceId),

    checkDeviceCredentials: (
      devicePayload: DeviceInfo & UserId,
    ): Promise<Result> => this.checkDeviceCredentials(devicePayload),

    deleteDeviceByIdAndUserId: (
      userId: string,
      deviceId: string,
    ): Promise<Result> => this.deleteDeviceByIdAndUserId(userId, deviceId),
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

  private async refreshToken(
    ip: string,
    title: string,
    userId: string,
    deviceId: string,
  ) {
    return this.commandBus.execute(
      new RefreshTokenCommand(ip, title, userId, deviceId),
    );
  }

  private async deleteDevicesByUserId(userId: string): Promise<void> {
    await this.deviceRepo.deleteDevicesByUserId(userId);
  }
  x;

  private async checkDeviceCredentials(
    devicePayload: DeviceInfo & UserId,
  ): Promise<Result> {
    return this.commandBus.execute<CheckDeviceCredentialsCommand, Result>(
      new CheckDeviceCredentialsCommand(devicePayload),
    );
  }

  private async deleteDeviceByIdAndUserId(
    userId: string,
    deviceId: string,
  ): Promise<Result> {
    return this.commandBus.execute<DeleteDeviceCommand, Result>(
      new DeleteDeviceCommand(userId, deviceId),
    );
  }
}
