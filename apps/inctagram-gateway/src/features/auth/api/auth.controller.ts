import { Response } from 'express';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  CreateUserDto,
  NewPasswordDto,
  RegistrationEmailResendingDto,
  UserPasswordRecoveryDto,
} from '../../user/dto';
import { UserFacade } from '../../user/user.facade';
import { ConfirmationCodeDto, GoogleLoginDto, LoginProviderDto } from '../dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ResponseUserDto } from '../../user/responses';
import { BadRequestResponse, CustomError } from '../../../core';
import { DeviceFacade } from '../../device/device.facade';
import { PasswordAuthGuard } from '../guards/password.guard';
import { CurrentUserId } from '../../../core/decorators/currentUserId.decorator';
import { DeviceDto } from '../../device/dto';
import { ResponseAccessTokenDto } from '../../device/responses';
import { CurrentDevice } from '../../../core/decorators/currentDevice.decorator';
import { RefreshJwtGuard } from '../guards/refreshJwt.guard';
import { LogoutSwaggerDecorator } from '../../../core/swagger/auth/logout.swagger.decorator';
import { AuthService } from '../auth.service';
import { PasswordRecoveryResendingDto } from '../../user/dto/passwordRecoveryResending.dto';
import { LoginSwaggerDecorator } from '../../../core/swagger/auth/login.swagger.decorator';
import { UserAgent } from '../../../core/decorators/userAgent.decorator';

const baseUrl = '/auth';

export const endpoints = {
  registration: () => `${baseUrl}/registration`,
  registrationConfirmation: () => `${baseUrl}/registration-confirmation`,
  passwordRecovery: () => `${baseUrl}/password-recovery`,
  newPassword: () => `${baseUrl}/new-password`,
  googleLogin: () => `${baseUrl}/google`,
  login: () => `${baseUrl}/login`,
  newRefreshToken: () => `${baseUrl}/refresh-token`,
  gitHubLogin: () => `${baseUrl}/github`,
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly userFacade: UserFacade,
    private readonly deviceFacade: DeviceFacade,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({
    summary: 'User registration',
  })
  @ApiCreatedResponse({ type: ResponseUserDto })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @Post('registration')
  async createUser(@Body() userDto: CreateUserDto): Promise<ResponseUserDto> {
    const resultCreated = await this.userFacade.useCases.createUser(userDto);

    if (!resultCreated.isSuccess) {
      throw resultCreated.err;
    }

    const resultView = await this.userFacade.queries.getUserViewById(
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
      await this.userFacade.useCases.confirmationRegistration(confirmDto);
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
    const resendingResult =
      await this.userFacade.useCases.registrationEmailResending(resendingDto);
    if (!resendingResult.isSuccess) {
      throw resendingResult.err;
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
    const recoveryResult = await this.userFacade.useCases.passwordRecovery(
      passwordRRecoveryDto,
    );
    if (!recoveryResult.isSuccess) {
      throw recoveryResult.err;
    }
  }

  @ApiOperation({
    summary: 'Resending password recovery code',
  })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @Post('password-recovery-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecoveryResending(
    @Body() resendingDto: PasswordRecoveryResendingDto,
  ) {
    const resendingResult =
      await this.userFacade.useCases.passwordRecoveryResending(resendingDto);
    if (!resendingResult.isSuccess) {
      throw resendingResult.err;
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
    const updateResult = await this.authService.newPassword(dto);
    if (!updateResult.isSuccess) {
      throw updateResult.err;
    }
  }

  @Post('login')
  @LoginSwaggerDecorator()
  @UseGuards(PasswordAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(
    @Ip() ip: string,
    @UserAgent() title: string,
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
      sameSite: 'none',
    });

    return new ResponseAccessTokenDto(accessToken);
  }

  @Post('refresh-token')
  @UseGuards(RefreshJwtGuard)
  async newRefreshToken(
    @Req() request: any,
    @Ip() ip: string,
    @UserAgent() title: string,
    @Res({ passthrough: true }) response: Response,
    @CurrentUserId() userId: string,
  ): Promise<ResponseAccessTokenDto | CustomError> {
    const payload = request.user;

    const result = await this.deviceFacade.useCases.refreshToken(
      ip,
      title,
      userId,
      payload.deviceId,
    );

    const { accessToken, refreshToken } = result.value;

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
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

  @ApiOkResponse({ type: ResponseAccessTokenDto })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Get('google')
  @ApiOperation({
    summary: 'Oauth2 google authorization',
  })
  @Get('google')
  async googleLogin(
    @Query() { code }: GoogleLoginDto,
    @Ip() ip: string,
    @UserAgent() title: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ResponseAccessTokenDto> {
    const providerDto: LoginProviderDto = {
      code,
      ip,
      title,
    };

    const result = await this.authService.googleLogin(providerDto);

    if (!result.isSuccess) {
      throw result.err;
    }

    const { accessToken, refreshToken } = result.value;

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return new ResponseAccessTokenDto(accessToken);
  }

  // @Get('github')
  // async gintHubLogin(
  //   @Query() { code }: GitHubLoginDto,
  //   @Ip() ip: string,
  //   @Headers('user-agent') title: string,
  //   @Res({ passthrough: true }) response: Response,
  // ): Promise<ResponseAccessTokenDto> {}
}
