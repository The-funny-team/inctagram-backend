import { Provider } from '@prisma/client';
import { Result } from '../../../../core';
import { UserFacade } from '../../../user/user.facade';
import { DeviceFacade } from '../../../device/device.facade';
import { LoginProviderDto } from '../../dto';
import { ProviderUserResponse } from '../../response';
import { CreateTokensType } from '../../../device/types/createTokens.type';

export abstract class BaseProvideLoginUseCase {
  abstract provider: Provider;

  protected constructor(
    private readonly userFacade: UserFacade,
    private readonly deviceFacade: DeviceFacade,
  ) {}

  abstract getProviderUser(code: string): Promise<Result<ProviderUserResponse>>;

  async execute({
    providerDto,
  }: {
    providerDto: LoginProviderDto;
  }): Promise<Result<CreateTokensType>> {
    const resultProviderUser = await this.getProviderUser(providerDto.code);
    if (!resultProviderUser.isSuccess) {
      return Result.Err(resultProviderUser.err);
    }
    const userData = resultProviderUser.value;
    const userProvider =
      await this.userFacade.repository.findUserProviderByProviderId(
        userData.id,
        this.provider,
      );

    if (userProvider) {
      return this.updateUserProviderAndLoginUser(
        userData,
        userProvider.userId,
        providerDto,
      );
    }

    const resultLink =
      await this.userFacade.useCases.linkProviderUserToExistingUser(
        this.provider,
        userData,
      );

    if (!resultLink.isSuccess) {
      return Result.Err(resultLink.err);
    }

    return this.loginUser(resultLink.value, providerDto);
  }

  private async loginUser(userId: string, providerDto: LoginProviderDto) {
    return this.deviceFacade.useCases.createDevice({
      ip: providerDto.ip,
      title: providerDto.title,
      userId: userId,
    });
  }

  private async updateUserProviderAndLoginUser(
    userData: ProviderUserResponse,
    userId: string,
    providerDto: LoginProviderDto,
  ) {
    await this.userFacade.repository.updateUserProviderByProviderId(
      { userId, providerUserId: userData.id, provider: this.provider },
      { name: userData.name, email: userData.email },
    );
    return this.loginUser(userId, providerDto);
  }
}
