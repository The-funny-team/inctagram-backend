import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceRepository } from '../../db';
import { ForbiddenError, NotFoundError, Result } from '../../../../core';
import { DEVICE_NOT_FOUND, FORBIDDEN_DEVICE } from '../../device.constants';

export class DeleteDeviceCommand {
  constructor(
    public userId: string,
    public deviceId: string,
  ) {}
}

@CommandHandler(DeleteDeviceCommand)
export class DeleteDeviceUseCase
  implements ICommandHandler<DeleteDeviceCommand>
{
  constructor(private readonly deviceRepo: DeviceRepository) {}

  async execute({ userId, deviceId }: DeleteDeviceCommand): Promise<Result> {
    const session = await this.deviceRepo.findById(deviceId);

    if (!session) return Result.Err(new NotFoundError(DEVICE_NOT_FOUND));

    if (session.userId !== userId)
      return Result.Err(new ForbiddenError(FORBIDDEN_DEVICE));

    await this.deviceRepo.deleteById(deviceId);

    return Result.Ok();
  }
}
