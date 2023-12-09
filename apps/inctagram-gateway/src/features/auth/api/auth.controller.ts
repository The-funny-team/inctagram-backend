import { Response } from 'express';
import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  CreateUserDto,
  NewPasswordDto,
  UserPasswordRecoveryDto,
} from '../../user/dto';
import { UserFasade } from '../../user/user.fasade';
import { ConfirmationCodeDto, RegistrationEmailResendingDto } from '../dto';
import {
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseUserDto } from '../../user/responses';
import { BadRequestResponse } from '../../../core';
import { DeviceFacade } from '../../device/device.facade';
import { PasswordAuthGuard } from '../guards/password.guard';
import { CurrentUserId } from '../../../core/decorators/currentUserId.decorator';
import { DeviceDto } from '../../device/dto';
import { ResponseAccessTokenDto } from '../../device/responses';
import { CurrentDevice } from '../../../core/decorators/currentDevice.decorator';
import { RefreshJwtGuard } from '../guards/refreshJwt.guard';
import { LogoutSwaggerDecorator } from '../../../core/swagger/auth/logout.swagger.decorator';

const baseUrl = '/auth';

export const endpoints = {
  registration: () => `${baseUrl}/registration`,
  registrationConfirmation: () => `${baseUrl}/registration-confirmation`,
  passwordRecovery: () => `${baseUrl}/password-recovery`,
  newPassword: () => `${baseUrl}/new-password`,
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly userFasade: UserFasade,
    private readonly deviceFacade: DeviceFacade,
  ) {}

  @ApiOperation({
    summary: 'User registration',
  })
  @ApiOkResponse({ type: ResponseUserDto })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @Post('registration')
  async createUser(@Body() userDto: CreateUserDto): Promise<ResponseUserDto> {
    const resultCreated = await this.userFasade.useCases.createUser(userDto);

    if (!resultCreated.isSuccess) {
      throw resultCreated.err;
    }

    const resultView = await this.userFasade.queries.getUserViewById(
      resultCreated.value.id,
    );
    if (!resultView.isSuccess) {
      throw resultCreated.err;
    }
    return resultView.value;
  }

  @ApiOperation({
    summary: 'User registration confirmation',
  })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmRegistration(@Body() confirmDto: ConfirmationCodeDto) {
    const confirmationResult =
      await this.userFasade.useCases.confirmationRegistration(confirmDto);
    if (!confirmationResult.isSuccess) {
      throw confirmationResult.err;
    }
  }

  @ApiOperation({
    summary: 'Resending confirmation code',
  })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendingConfirmationCodeToUser(
    @Body() resendingDto: RegistrationEmailResendingDto,
  ) {
    const confirmationResult =
      await this.userFasade.useCases.registrationEmailResending(resendingDto);
    if (!confirmationResult.isSuccess) {
      throw confirmationResult.err;
    }
  }

  @ApiOperation({
    summary: 'User password recovery',
  })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(
    @Body() passwordRRecoveryDto: UserPasswordRecoveryDto,
  ) {
    const recoveryResult = await this.userFasade.useCases.passwordRecovery(
      passwordRRecoveryDto,
    );
    if (!recoveryResult.isSuccess) {
      throw recoveryResult.err;
    }
  }

  @ApiOperation({
    summary: 'Changing the user password',
  })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(@Body() dto: NewPasswordDto) {
    const updateResult = await this.userFasade.useCases.newPassword(dto);
    if (!updateResult.isSuccess) {
      throw updateResult.err;
    }
  }

  @Post('login')
  @UseGuards(PasswordAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(
    @Ip() ip: string,
    @Headers('user-agent') title: string,
    @Res({ passthrough: true }) response: Response,
    @CurrentUserId() userId: string,
  ): Promise<ResponseAccessTokenDto> {
    const result = await this.deviceFacade.useCases.createDevice(
      new DeviceDto(ip, title, userId),
    );
    const { accessToken, refreshToken } = result.value;

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return new ResponseAccessTokenDto(accessToken);
  }

  @Post('logout')
  @LogoutSwaggerDecorator()
  @UseGuards(RefreshJwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Res({ passthrough: true }) response: Response,
    @CurrentUserId() userId: string,
    @CurrentDevice() deviceId: string,
  ): Promise<void> {
    const result = await this.deviceFacade.useCases.deleteDeviceByIdAndUserId(
      userId,
      deviceId,
    );
    if (!result.isSuccess) throw result.err;
    response.clearCookie('refreshToken');
    return;
  }
}
