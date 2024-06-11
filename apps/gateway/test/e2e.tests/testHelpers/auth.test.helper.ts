import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { endpoints } from '../../../src/features/auth/api';
import {
  CreateUserDto,
  NewPasswordDto,
  UserPasswordRecoveryDto,
} from '../../../src/features/user/dto';
import { ConfirmationCodeDto } from '../../../src/features/auth/dto';
import { getGlobalPrefix, randomString } from '../utils/tests.utils';
import { LoginDto } from '@gateway/src/features/auth/dto/login.dto';

export class AuthTestHelper {
  globalPrefix = getGlobalPrefix();

  constructor(private app: INestApplication) {}

  userDto(): CreateUserDto {
    const password = `${randomString(10)}TU1!`;
    return {
      username: randomString(10),
      email: `${randomString(6)}@test.com`,
      password: password,
      passwordConfirm: password,
    };
  }

  async registrationUser(
    userDto: CreateUserDto,
    config: {
      expectedCode?: number;
    } = {},
  ) {
    const expectedCode = config.expectedCode ?? HttpStatus.CREATED;

    return request(this.app.getHttpServer())
      .post(this.globalPrefix + endpoints.registration())
      .send(userDto)
      .expect(expectedCode);
  }

  async confirmRegistration(
    confirmDto: ConfirmationCodeDto,
    config: {
      expectedCode?: number;
    } = {},
  ) {
    const expectedCode = config.expectedCode ?? HttpStatus.NO_CONTENT;

    return request(this.app.getHttpServer())
      .post(this.globalPrefix + endpoints.registrationConfirmation())
      .send(confirmDto)
      .expect(expectedCode);
  }

  async login(
    loginDto: Pick<LoginDto, 'email' | 'password'>,
    deviceName: string,
    config: {
      expectedCode?: number;
    } = {},
  ) {
    const expectedCode = config.expectedCode ?? HttpStatus.OK;

    return request(this.app.getHttpServer())
      .post(this.globalPrefix + endpoints.login())
      .send(loginDto)
      .set('user-agent', deviceName)
      .expect(expectedCode);
  }

  async newRefreshToken(
    refreshToken: string,
    deviceName: string,
    config: {
      expectedCode?: number;
    } = {},
  ) {
    const expectedCode = config.expectedCode ?? HttpStatus.NO_CONTENT;

    return request(this.app.getHttpServer())
      .post(this.globalPrefix + endpoints.newRefreshToken())
      .send()
      .set('Cookie', `${refreshToken}`)
      .set('user-agent', deviceName)
      .expect(expectedCode);
  }

  async passwordRecovery(
    passwordRRecoveryDto: UserPasswordRecoveryDto,
    config: {
      expectedCode?: number;
    } = {},
  ) {
    const expectedCode = config.expectedCode ?? HttpStatus.NO_CONTENT;

    return request(this.app.getHttpServer())
      .post(this.globalPrefix + endpoints.passwordRecovery())
      .send(passwordRRecoveryDto)
      .expect(expectedCode);
  }

  async newPassword(
    dto: NewPasswordDto,
    config: {
      expectedCode?: number;
    } = {},
  ) {
    const expectedCode = config.expectedCode ?? HttpStatus.NO_CONTENT;

    return request(this.app.getHttpServer())
      .post(this.globalPrefix + endpoints.newPassword())
      .send(dto)
      .expect(expectedCode);
  }

  async registrationUserAndLogin({
    emailAdapterMock,
  }: {
    emailAdapterMock: {
      sendEmailConfirmationCode: jest.Mock;
      sendRecoveryPasswordTempCode: jest.Mock;
    };
  }) {
    const userDto = this.userDto();

    await this.registrationUser(userDto);
    await new Promise((pause) => setTimeout(pause, 100));

    const mock = emailAdapterMock.sendEmailConfirmationCode.mock;
    const lastMockCall = mock.calls.length - 1;

    const codeConfirmation = mock.calls[lastMockCall][0].token;

    await this.confirmRegistration({ code: codeConfirmation });

    const loginData = new LoginDto(userDto.email, userDto.password);

    const deviceName = 'chrome';

    const tokenPairs = await this.login(loginData, deviceName);

    const accessToken = tokenPairs.body.accessToken;

    return {
      accessToken,
    };
  }
}
