import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '@gateway/src/core';
import { DeviceDto } from '@gateway/src/features/device/dto';
import {
  CreateDeviceCommand,
  DeleteDeviceCommand,
} from '@gateway/src/features/device/application';

export class RefreshTokenCommand {
  constructor(
    public ip: string,
    public title: string,
    public userId: string,
    public deviceId: string,
  ) {}
}

//TODO: When I inject DeviceFacade it gives error.
@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    //private readonly deviceFacade: DeviceFacade,
    private commandBus: CommandBus,
  ) {}

  async execute(command: RefreshTokenCommand) {
    const isDeleted: Result = await this.commandBus.execute(
      new DeleteDeviceCommand(command.userId, command.deviceId),
    );
    // await this.deviceFacade.useCases.deleteDeviceByIdAndUserId(
    //   command.userId,
    //   command.deviceId,
    // );

    if (!isDeleted.isSuccess) {
      return isDeleted.err;
    }

    return this.commandBus.execute(
      new CreateDeviceCommand(
        new DeviceDto(command.ip, command.title, command.userId),
      ),
    );
    // return await this.deviceFacade.useCases.createDevice(
    //   new DeviceDto(command.ip, command.title, command.userId),
    // );
  }
}
