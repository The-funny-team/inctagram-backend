import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtConfig } from '../../../core/jwt-adapter/jwt.config';
import { AccessJwtPayloadType } from '../types/accessJwtPayload.type';
import { UserFacade } from '../../user/user.facade';
import { UserId } from '../../user/types';
import { UnauthorizedError } from '../../../core';
import { USER_NOT_FOUND } from '../../user/user.constants';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(
    private jwtConfig: JwtConfig,
    private userFacade: UserFacade,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConfig.accessJwtSecret,
    });
  }

  async validate(payload: AccessJwtPayloadType): Promise<UserId> {
    const user = await this.userFacade.repository.findUserById(payload.userId);

    if (!user) throw new UnauthorizedError(USER_NOT_FOUND);

    return { userId: payload.userId };
  }
}
