import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { UserQueryRepository } from '../db';
import { ResponseUserDto } from '../responses';
import { ApiTags } from '@nestjs/swagger';
import { UserSwaggerDecorator } from '@gateway/src/core/swagger/user/user.swagger.decorator';
import { TotalUsersSwaggerDecorator } from '@gateway/src/core/swagger/user/totalUsers.swagger.decorator';
import { ResultInterceptor } from '@gateway/src/core/result-intercepter/result.interceptor';
import { Result } from '@gateway/src/core';
import { ResponseGetTotalUsersDto } from '@gateway/src/features/user/responses';

const baseUrl = '/public-user';
export const endpoints = {
  getUser: () => `${baseUrl}/profile`,
  getTotal: () => `${baseUrl}/total`,
};

@ApiTags('Public User')
@Controller('public-user')
export class PublicUserController {
  constructor(private readonly userQueryRepo: UserQueryRepository) {}

  @UserSwaggerDecorator()
  @UseInterceptors(ResultInterceptor)
  @Get('profile/:userName')
  async getUser(
    @Param('userName') userName: string,
  ): Promise<Result<ResponseUserDto>> {
    return await this.userQueryRepo.getUserByNameView(userName);
  }

  @TotalUsersSwaggerDecorator()
  @UseInterceptors(ResultInterceptor)
  @Get('total')
  async getTotal(): Promise<Result<ResponseGetTotalUsersDto>> {
    return await this.userQueryRepo.getTotalUsers();
  }
}
