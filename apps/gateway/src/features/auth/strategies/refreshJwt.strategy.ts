import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtConfig } from '../../../core/jwt-adapter/jwt.config';
import { RefreshJwtPayload } from '../types/refreshJwtPayload.type';
import { DeviceInfo } from '../../device/types/deviceInfo.type';
import { UserId } from '../../user/types';
import { DeviceFacade } from '../../device/device.facade';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private jwtConfig: JwtConfig,
    private readonly deviceFacade: DeviceFacade,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const data = request.cookies.refreshToken;
          if (!data) return null;
          return data;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.refreshJwtSecret,
    });
  }

  async validate(payload: RefreshJwtPayload): Promise<DeviceInfo & UserId> {
    const { userId, deviceId, iat, exp } = payload;

    const devicePayload = {
      userId,
      deviceId,
      lastActiveDate: new Date(iat * 1000),
      expirationDate: new Date(exp * 1000),
    };

    const result = await this.deviceFacade.useCases.checkDeviceCredentials(
      devicePayload,
    );

    if (!result.isSuccess) throw result.err;

    return devicePayload;
  }
}
