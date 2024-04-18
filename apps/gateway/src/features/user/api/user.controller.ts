import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUserId } from '../../../core/decorators/currentUserId.decorator';
import { CommandBus } from '@nestjs/cqrs';
import {
  DeleteAvatarUserCommand,
  UpdateUserCommand,
  UploadAvatarUserCommand,
} from '../application';
import { Result } from '../../../core';
import { AccessTokenGuard } from '../../auth/guards/accessJwt.guard';
import { ImageInputDto, UpdateUserDto } from '../dto';
import { UserQueryRepository } from '../db';
import { ResponseUserDto } from '../responses';
import { ApiTags } from '@nestjs/swagger';
import { MeSwaggerDecorator } from '../../../core/swagger/user/me.swagger.decorator';
import { UpdateUserSwaggerDecorator } from '../../../core/swagger/user/updateUser.swagger.decorator';
import { DeleteUserAvatarSwaggerDecorator } from '@gateway/src/core/swagger/user/deleteUserAvatar.swagger.decorator';
import { UploadUserAvatarSwaggerDecorator } from '@gateway/src/core/swagger/user/uploadUserAvatar.swagger.decorator';
import { UserSwaggerDecorator } from '@gateway/src/core/swagger/user/user.swagger.decorator';

const baseUrl = '/user';
export const endpoints = {
  me: () => `${baseUrl}/me`,
  getUser: () => `${baseUrl}`,
  updateUser: () => `${baseUrl}`,
};

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly userQueryRepo: UserQueryRepository,
  ) {}

  @MeSwaggerDecorator()
  @UseGuards(AccessTokenGuard)
  @Get('me')
  async me(@CurrentUserId() userId: string): Promise<ResponseUserDto> {
    const userViewResult = await this.userQueryRepo.getUserView(userId);
    if (!userViewResult.isSuccess) {
      throw userViewResult.err;
    }
    return userViewResult.value;
  }

  @UserSwaggerDecorator()
  @Get(':userName')
  async getUser(@Param('userName') userName: string): Promise<ResponseUserDto> {
    const userViewResult = await this.userQueryRepo.getUserView(userName);

    if (!userViewResult.isSuccess) {
      throw userViewResult.err;
    }
    return userViewResult.value;
  }

  @UpdateUserSwaggerDecorator()
  @UseGuards(AccessTokenGuard)
  @Put()
  async updateUser(
    @CurrentUserId() userId: string,
    @Body() updateDto: UpdateUserDto,
  ): Promise<ResponseUserDto> {
    const updateResult = await this.commandBus.execute<
      UpdateUserCommand,
      Result
    >(new UpdateUserCommand(userId, updateDto));

    if (!updateResult.isSuccess) {
      throw updateResult.err;
    }

    const userViewResult = await this.userQueryRepo.getUserView(userId);
    if (!userViewResult.isSuccess) {
      throw userViewResult.err;
    }
    return userViewResult.value;
  }

  @UploadUserAvatarSwaggerDecorator()
  @UseGuards(AccessTokenGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @CurrentUserId() userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10000000 }),
          new FileTypeValidator({ fileType: 'image/jpeg|image/png' }),
        ],
        fileIsRequired: true,
        exceptionFactory: (error) => {
          throw new BadRequestException([{ message: error, field: 'file' }]);
        },
      }),
    )
    file: Express.Multer.File,
  ) {
    const data: ImageInputDto = {
      userId,
      originalname: file.originalname,
      buffer: file.buffer,
    };

    const downloadResult = await this.commandBus.execute<
      UploadAvatarUserCommand,
      Result
    >(new UploadAvatarUserCommand(data));
    if (!downloadResult.isSuccess) {
      throw downloadResult.err;
    }
  }

  @DeleteUserAvatarSwaggerDecorator()
  @UseGuards(AccessTokenGuard)
  @Delete('avatar')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAvatar(@CurrentUserId() userId: string) {
    const deletionResult = await this.commandBus.execute<
      DeleteAvatarUserCommand,
      Result
    >(new DeleteAvatarUserCommand(userId));
    if (!deletionResult.isSuccess) {
      throw deletionResult.err;
    }
  }
}
