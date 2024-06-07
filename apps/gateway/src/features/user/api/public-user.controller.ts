import { Controller, Get, Param } from '@nestjs/common';
import { UserQueryRepository } from '../db';
import { ResponseUserDto } from '../responses';
import { ApiTags } from '@nestjs/swagger';
import { UserSwaggerDecorator } from '@gateway/src/core/swagger/user/user.swagger.decorator';
import { TotalUsersSwaggerDecorator } from '@gateway/src/core/swagger/user/totalUsers.swagger.decorator';

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
  @Get('profile/:userName')
  async getUser(@Param('userName') userName: string): Promise<ResponseUserDto> {
    const userViewResult = await this.userQueryRepo.getUserView(userName);

    if (!userViewResult.isSuccess) {
      throw userViewResult.err;
    }
    return userViewResult.value;
  }

  @TotalUsersSwaggerDecorator()
  @Get('total')
  async getTotal() {
    return this.userQueryRepo.getTotalUsers();
  }
}
