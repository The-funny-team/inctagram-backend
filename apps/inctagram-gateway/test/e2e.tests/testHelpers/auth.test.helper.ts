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
}
