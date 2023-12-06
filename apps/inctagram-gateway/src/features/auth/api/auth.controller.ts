import { Response } from 'express';
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  CreateUserDto,
  NewPasswordDto,
  UserPasswordRecoveryDto,
} from '../../user/dto';
import { UserFacade } from '../../user/user.facade';
import { ConfirmationCodeDto, GoogleLoginDto, LoginProviderDto } from '../dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseUserDto } from '../../user/responses';
import { BadRequestResponse } from '../../../core/responses';
import { DeviceFacade } from '../../device/device.facade';
import { PasswordAuthGuard } from '../guards/password.guard';
import { CurrentUserId } from '../../../core/decorators/currentUserId.decorator';
import { UserIdType } from '../../user/types/userId.type';
import { DeviceDto } from '../../device/dto/device.dto';
import { ResponseAccessTokenDto } from '../../device/responses/responseAccessToken.dto';
import { AuthService } from '../auth.service';

const baseUrl = '/auth';

export const endpoints = {
  registration: () => `${baseUrl}/registration`,
  registrationConfirmation: () => `${baseUrl}/registration-confirmation`,
  passwordRecovery: () => `${baseUrl}/password-recovery`,
  newPassword: () => `${baseUrl}/new-password`,
  googleLogin: () => `${baseUrl}/google`,
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
  @UseGuards(PasswordAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(
    @Ip() ip: string,
    @Headers('user-agent') title: string,
    @Res({ passthrough: true }) response: Response,
    @CurrentUserId() userIdDto: UserIdType,
  ): Promise<ResponseAccessTokenDto> {
    const result = await this.deviceFacade.useCases.createDevice(
      new DeviceDto(ip, title, userIdDto.userId),
    );
    const { accessToken, refreshToken } = result.value;

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return new ResponseAccessTokenDto(accessToken);
  }

  @Get('google')
  async googleLogin(
    @Query() { code }: GoogleLoginDto,
    @Ip() ip: string,
    @Headers('user-agent') title: string,
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
