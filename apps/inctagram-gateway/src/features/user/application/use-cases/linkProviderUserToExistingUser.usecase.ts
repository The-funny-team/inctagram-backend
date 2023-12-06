import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../db';
import { Provider } from '@prisma/client';
import { ProviderUserResponse } from '../../../auth/response';
import { Result } from '../../../../core';
import { LinkProviderUserToExistingUser } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export class LinkProviderUserToExistingUserCommand {
  constructor(
    public provider: Provider,
    public userData: ProviderUserResponse,
  ) {}
}

@CommandHandler(LinkProviderUserToExistingUserCommand)
export class LinkProviderUserToExistingUserUseCase
  implements ICommandHandler<LinkProviderUserToExistingUserCommand>
{
  constructor(private readonly userRepo: UserRepository) {}

  async execute({
    provider,
    userData,
  }: LinkProviderUserToExistingUserCommand): Promise<Result<string>> {
    const userByEmail = await this.userRepo.findByUsernameOrEmail(
      userData.email,
    );

    let userId: string;
    if (!userByEmail) {
      const createdUser = await this.createUserWithProviderUser(
        provider,
        userData,
      );
      userId = createdUser.id;
    } else {
      await this.linkProviderUserToExistingUser(
        userByEmail.id,
        provider,
        userData,
      );
      userId = userByEmail.id;
    }

    return Result.Ok<string>(userId);
  }

  private async createUserWithProviderUser(
    provider: Provider,
    userData: ProviderUserResponse,
  ) {
    const username = `client_${uuidv4()}`;
    return this.userRepo.createUserAndProviderUser(
      userData,
      provider,
      username,
    );
  }

  private async linkProviderUserToExistingUser(
    userId: string,
    provider: Provider,
    userData: ProviderUserResponse,
  ) {
    const data: LinkProviderUserToExistingUser = {
      userId,
      provider,
      providerUserId: userData.id,
      name: userData.name,
      email: userData.email,
    };
    await this.userRepo.linkProviderUserToExistingUser(data);
  }
}
