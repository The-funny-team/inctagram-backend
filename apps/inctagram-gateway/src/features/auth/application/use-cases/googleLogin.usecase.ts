import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BaseProvideLoginUseCase } from './baseProviderLogin.usecase';
import { ForbiddenError, Result, UnauthorizedError } from '../../../../core';
import { ProviderUserResponse } from '../../response';
import { Provider } from '@prisma/client';
import { LoginProviderDto } from '../../dto';
import { UserFacade } from '../../../user/user.facade';
import { DeviceFacade } from '../../../device/device.facade';
import { Logger } from '@nestjs/common';
import { GoogleOauth2Config } from '../../../device/config';
import { HttpService } from '@nestjs/axios';
import {
  ERROR_GOOGLE_ACCOUNT_NOT_VERIFIED,
  ERROR_GOOGLE_OAUTH_TOKENS,
  ERROR_PROVIDER_AUTHORIZATION_CODE,
} from '../../../device/device.constants';
import { GoogleOauthToken, GoogleUserResult } from '../../../device/types';
import qs from 'qs';

export class GoogleLoginCommand {
  constructor(public providerDto: LoginProviderDto) {}
}

@CommandHandler(GoogleLoginCommand)
export class GoogleLoginUseCase
  extends BaseProvideLoginUseCase
  implements ICommandHandler<GoogleLoginCommand>
{
  logger = new Logger(GoogleLoginUseCase.name);
  provider = Provider.GOOGLE;
  settingsOauth2;

  constructor(
    userFacade: UserFacade,
    deviceFacade: DeviceFacade,
    private readonly googleOauth2Config: GoogleOauth2Config,
    private readonly httpService: HttpService,
  ) {
    super(userFacade, deviceFacade);
    this.settingsOauth2 = googleOauth2Config.getSettings();
  }

  async getProviderUser(code: string): Promise<Result<ProviderUserResponse>> {
    if (!code) {
      return Result.Err(
        new UnauthorizedError(ERROR_PROVIDER_AUTHORIZATION_CODE),
      );
    }

    const resultOauthTokens = await this.getGoogleOauthToken(code);
    if (!resultOauthTokens.isSuccess) {
      return Result.Err(resultOauthTokens.err);
    }
    const { id_token, access_token } = resultOauthTokens.value;

    const resultGoogleUser = await this.getGoogleUser(id_token, access_token);
    if (!resultGoogleUser.isSuccess) {
      return Result.Err(resultOauthTokens.err);
    }

    const { id, name, verified_email, email } = resultGoogleUser.value;
    if (!verified_email) {
      return Result.Err(new ForbiddenError(ERROR_GOOGLE_ACCOUNT_NOT_VERIFIED));
    }
    return Result.Ok({ id, name, email });
  }

  private async getGoogleOauthToken(
    code: string,
  ): Promise<Result<GoogleOauthToken>> {
    const rootURl = this.settingsOauth2.rootURl;

    const options = {
      code,
      client_id: this.settingsOauth2.clientId,
      client_secret: this.settingsOauth2.clientSecret,
      redirect_uri: this.settingsOauth2.redirectUri,
      grant_type: this.settingsOauth2.grantType,
    };
    try {
      const { data } = await this.httpService.axiosRef.post<GoogleOauthToken>(
        rootURl,
        qs.stringify(options),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return Result.Ok<GoogleOauthToken>(data);
    } catch (err: any) {
      this.logger.log(err.response.data.error);
      return Result.Err(new ForbiddenError(ERROR_GOOGLE_OAUTH_TOKENS));
    }
  }

  private async getGoogleUser(
    id_token: string,
    access_token: string,
  ): Promise<Result<GoogleUserResult>> {
    try {
      const { data } = await this.httpService.axiosRef.get<GoogleUserResult>(
        `${this.settingsOauth2.accessTokenURL}?alt=json&access_token=${access_token}`,
        {
          headers: {
            Authorization: `Bearer ${id_token}`,
          },
        },
      );
      return Result.Ok<GoogleUserResult>(data);
    } catch (err) {
      this.logger.log(err);
      return Result.Err(new ForbiddenError(err.message));
    }
  }
}
