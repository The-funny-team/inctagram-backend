import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BaseProvideLoginUseCase } from './baseProviderLogin.usecase';
import { ForbiddenError, Result, UnauthorizedError } from '../../../../core';
import { ProviderUserResponse } from '../../response';
import { Provider } from '@prisma/client';
import { LoginProviderDto } from '../../dto';
import { UserFacade } from '../../../user/user.facade';
import { DeviceFacade } from '../../../device/device.facade';
import { Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  ERROR_GITHUB_ACCOUNT_NOT_VERIFIED,
  ERROR_GITHUB_OAUTH_TOKENS,
  ERROR_PROVIDER_AUTHORIZATION_CODE,
} from '../../../device/device.constants';
import { GitHubOauthToken } from '@gateway/src/features/device/types/githubOauthToken.type';
import { GitHubOauth2Config } from '@gateway/src/features/device/config/githubOauth2.config';

export class GitHubLoginCommand {
  constructor(public providerDto: LoginProviderDto) {}
}

@CommandHandler(GitHubLoginCommand)
export class GitHubLoginUseCase
  extends BaseProvideLoginUseCase
  implements ICommandHandler<GitHubLoginCommand>
{
  logger = new Logger(GitHubLoginUseCase.name);
  provider = Provider.GIT_HUB;
  settingsOauth2: any | null = null;

  constructor(
    userFacade: UserFacade,
    deviceFacade: DeviceFacade,
    readonly githubOauth2Config: GitHubOauth2Config,
    private readonly httpService: HttpService,
  ) {
    super(userFacade, deviceFacade);
    this.settingsOauth2 = githubOauth2Config.getSettings();
  }

  async getProviderUser(code: string): Promise<Result<ProviderUserResponse>> {
    if (!code) {
      return Result.Err(
        new UnauthorizedError(ERROR_PROVIDER_AUTHORIZATION_CODE),
      );
    }

    const resultOauthTokens: Result<GitHubOauthToken> =
      await this.getGitHubOauthToken(code);

    if (!resultOauthTokens.isSuccess) {
      return Result.Err(resultOauthTokens.err);
    }

    const { access_token } = resultOauthTokens.value;

    const resultGitHubUserInfo = await this.getGitHubUser(
      access_token,
      this.settingsOauth2.userInfoURL,
    );
    if (!resultGitHubUserInfo.isSuccess) {
      return Result.Err(resultOauthTokens.err);
    }

    const resultGitHubUserEmails = await this.getGitHubUser(
      access_token,
      this.settingsOauth2.userEmailsInfo,
    );
    let email;

    for (const userEmail of resultGitHubUserEmails.value) {
      if (userEmail.primary && userEmail.verified) {
        email = userEmail.email;
      }
    }

    if (!email) {
      return Result.Err(new ForbiddenError(ERROR_GITHUB_ACCOUNT_NOT_VERIFIED));
    }

    const { id, name } = resultGitHubUserInfo.value;

    return Result.Ok({ id: id.toString(), name, email });
  }

  private async getGitHubOauthToken(
    code: string,
  ): Promise<Result<GitHubOauthToken>> {
    const rootURl = this.settingsOauth2.rootURl;

    const options = {
      code,
      client_id: this.settingsOauth2.clientId,
      client_secret: this.settingsOauth2.clientSecret,
      redirect_uri: this.settingsOauth2.redirectUri,
      grant_type: this.settingsOauth2.grantType,
    };
    try {
      const { data } = await this.httpService.axiosRef.post<GitHubOauthToken>(
        rootURl,
        options,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );
      return Result.Ok<GitHubOauthToken>(data);
    } catch (err: any) {
      this.logger.log(err.response.data.error);
      return Result.Err(new ForbiddenError(ERROR_GITHUB_OAUTH_TOKENS));
    }
  }

  private async getGitHubUser(access_token: string, url: string) {
    try {
      const { data } = await this.httpService.axiosRef.get(url, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      return Result.Ok(data);
    } catch (err) {
      this.logger.log(err);
      return Result.Err(new ForbiddenError(err.message));
    }
  }
}
