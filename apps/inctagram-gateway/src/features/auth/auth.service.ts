import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { GoogleLoginCommand } from './application';
import { CreateTokensType } from '../device/types/createTokens.type';
import { Result } from '../../core';
import { LoginProviderDto } from './dto';
import { NewPasswordDto } from '../user/dto';
import { UserFacade } from '../user/user.facade';
import { DeviceFacade } from '../device/device.facade';

@Injectable()
export class AuthService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly userFacade: UserFacade,
    private readonly deviceFacade: DeviceFacade,
  ) {}

  async googleLogin(
    providerDto: LoginProviderDto,
  ): Promise<Result<CreateTokensType>> {
    return this.commandBus.execute<
      GoogleLoginCommand,
      Result<CreateTokensType>
    >(new GoogleLoginCommand(providerDto));
  }

  async newPassword(dto: NewPasswordDto): Promise<Result> {
    const updateResult = await this.userFacade.useCases.newPassword(dto);
    if (!updateResult.isSuccess) {
      return Result.Err(updateResult.err);
    }

    const user = updateResult.value;
    await this.deviceFacade.repository.deleteDevicesByUserId(user.id);
    return Result.Ok();
  }
}
