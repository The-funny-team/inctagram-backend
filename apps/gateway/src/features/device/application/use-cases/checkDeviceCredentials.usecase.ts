import { DeviceInfo } from '../../types/deviceInfo.type';
import { UserId } from '../../../user/types';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceRepository } from '../../db';
import { Result, UnauthorizedError } from '../../../../core';
import { DEVICE_NOT_FOUND, EXPIRED_DEVICE } from '../../device.constants';

export class CheckDeviceCredentialsCommand {
  constructor(public devicePayload: DeviceInfo & UserId) {}
}

@CommandHandler(CheckDeviceCredentialsCommand)
export class CheckDeviceCredentialsUseCase
  implements ICommandHandler<CheckDeviceCredentialsCommand>
{
  constructor(private readonly deviceRepo: DeviceRepository) {}

  async execute({
    devicePayload,
  }: CheckDeviceCredentialsCommand): Promise<Result> {
    const { deviceId, userId, lastActiveDate } = devicePayload;
    const device = await this.deviceRepo.findByUserIdAndDeviceId(
      userId,
      deviceId,
    );
    if (!device) return Result.Err(new UnauthorizedError(DEVICE_NOT_FOUND));

    if (device.lastActiveDate.getTime() !== lastActiveDate.getTime())
      return Result.Err(new UnauthorizedError(EXPIRED_DEVICE));

    return Result.Ok();
  }
}
