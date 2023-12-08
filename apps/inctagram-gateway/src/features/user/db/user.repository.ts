import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.servise';
import { CreateUserDto, CreateUserInfoDto } from '../dto';
import { Provider, User, UserRegistrationInfo } from '@prisma/client';
import {
  LinkProviderUserToExistingUser,
  CreatedUserWithRegistrationInfo,
  UpdateUserProviderByProviderIdData,
  UpdateUserProviderByProviderIdParams,
} from '../types';
import { ProviderUserResponse } from '../../auth/response';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) { }

  async create(
    userDto: CreateUserDto,
    userInfo: CreateUserInfoDto,
  ): Promise<CreatedUserWithRegistrationInfo> {
    const createdUser = await this.prismaService.user.create({
      data: {
        name: userDto.username,
        email: userDto.email,
        hashPassword: userDto.password,
      },
    });

    const createdUserInfo =
      await this.prismaService.userRegistrationInfo.create({
        data: {
          userId: createdUser.id,
          confirmationCode: userInfo.confirmationCode,
          expirationConfirmationCode: userInfo.expirationConfirmationCode,
        },
      });

    return {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      hashPassword: createdUser.hashPassword,
      userRegistrationInfo: {
        id: createdUserInfo.id,
        isConfirmed: createdUserInfo.isConfirmed,
      },
    };
  }

  async update(id: string, data: Partial<Omit<User, 'id'>>) {
    return this.prismaService.user.update({ where: { id }, data });
  }

  async findByUsernameOrEmail(
    usernameOrEmail: string,
  ): Promise<CreatedUserWithRegistrationInfo | null> {
    return this.prismaService.user.findFirst({
      where: {
        OR: [{ name: usernameOrEmail }, { email: usernameOrEmail }],
      },
      select: {
        id: true,
        name: true,
        hashPassword: true,
        email: true,
        userRegistrationInfo: { select: { isConfirmed: true, id: true } },
      },
    });
  }

  async findByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email },
      include: {
        userRegistrationInfo: { select: { isConfirmed: true } },
      },
    });
  }

  updateRegistrationInfo(
    id: string,
    data: Partial<Omit<UserRegistrationInfo, 'id'>>,
  ): Promise<UserRegistrationInfo> {
    return this.prismaService.userRegistrationInfo.update({
      where: { id },
      data: data,
    });
  }

  async findByCodeConfirmation(
    code: string,
  ): Promise<UserRegistrationInfo | null> {
    return this.prismaService.userRegistrationInfo.findFirst({
      where: { confirmationCode: code },
    });
  }

  async findByRecoveryCode(recoveryCode: string) {
    return this.prismaService.userRegistrationInfo.findFirst({
      where: { recoveryCode },
    });
  }

  async findUserProviderByProviderId(
    providerUserId: string,
    provider: Provider,
  ) {
    return this.prismaService.userProvider.findFirst({
      where: { providerUserId, provider },
    });
  }

  async updateUserProviderByProviderId(
    params: UpdateUserProviderByProviderIdParams,
    data: UpdateUserProviderByProviderIdData,
  ) {
    return this.prismaService.userProvider.update({
      where: {
        userId: params.userId,
        providerUserId: params.providerUserId,
        provider: params.provider,
      },
      data: { name: data.name, email: data.email },
    });
  }

  async createUserAndProviderUser(
    userData: ProviderUserResponse,
    provider: Provider,
    username: string,
  ) {
    return this.prismaService.user.create({
      data: {
        name: username,
        email: userData.email,
        providers: {
          create: [
            {
              provider,
              providerUserId: userData.id,
              name: userData.name,
              email: userData.email,
            },
          ],
        },
      },
    });
  }

  async linkProviderUserToExistingUser(data: LinkProviderUserToExistingUser) {
    return this.prismaService.userProvider.create({
      data: {
        userId: data.userId,
        provider: data.provider,
        providerUserId: data.providerUserId,
        name: data.name,
        email: data.email,
      },
    });
  }

  async numberClientUsers() {
    return this.prismaService.user.count({
      where: { name: { startsWith: 'client' } },
    });
  }
}
