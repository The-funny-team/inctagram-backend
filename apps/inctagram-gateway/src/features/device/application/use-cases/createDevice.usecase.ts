import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceDto } from '../../dto';
import { Result } from '../../../../core';
import { randomUUID } from 'crypto';
import { JwtAdapter } from '../../../../core/jwt-adapter/jwt.adapter';
import { CreateDeviceType } from '../../types';
import { DeviceRepository } from '../../db';
import { CreateTokensType } from '../../types/createTokens.type';

export class CreateDeviceCommand {
  constructor(public deviceDto: DeviceDto) {}
}

@CommandHandler(CreateDeviceCommand)
export class CreateDeviceUseCase
  implements ICommandHandler<CreateDeviceCommand>
{
  constructor(
    private readonly jwtAdapter: JwtAdapter,
    private readonly deviceRepo: DeviceRepository,
  ) {}

  async execute({
    deviceDto,
  }: CreateDeviceCommand): Promise<Result<CreateTokensType>> {
    const { userId, title, ip } = deviceDto;

    const deviceId = randomUUID();

    const { accessToken, refreshToken } = await this.createTokens(
      userId,
      deviceId,
    );

    // decode token to take iat and exp
    const { iat, exp } = this.decodeRefreshToken(refreshToken);

    //deviceDto
    const newDevice: CreateDeviceType = {
      id: deviceId,
      ip,
      userId,
      title,
      lastActiveDate: new Date(iat * 1000),
      expirationDate: new Date(exp * 1000),
    };

    await this.deviceRepo.create(newDevice);

    return Result.Ok({ accessToken, refreshToken });
  }

  private async createTokens(userId: string, deviceId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtAdapter.createAccessToken(userId),
      this.jwtAdapter.createRefreshToken(userId, deviceId),
    ]);
    return { accessToken, refreshToken };
  }

  private decodeRefreshToken(token: string) {
    return this.jwtAdapter.decodeToken(token);
  }
}
