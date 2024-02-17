import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { findUUIDv4, getGlobalPrefix } from '../utils/tests.utils';
import { AuthTestHelper } from './auth.test.helper';
import { ResponseUserDto } from '@gateway/src/features/user/responses';
import { CreateUserDto, UpdateUserDto } from '@gateway/src/features/user/dto';
import { endpoints } from '@gateway/src/features/user/api/user.controller';

export class UserTestHelper {
  globalPrefix = getGlobalPrefix();
  constructor(private app: INestApplication) {}

  async createRegisteredAndVerifiedUser(
    newUserData: CreateUserDto,
    authTestHelper: AuthTestHelper,
    emailAdapterMock,
  ): Promise<ResponseUserDto> {
    const { body } = await authTestHelper.registrationUser(newUserData);
    const user: ResponseUserDto = body;

    await new Promise((pause) => setTimeout(pause, 100));
    const mock = emailAdapterMock.sendEmail.mock;
    const lastMockCall = mock.calls.length - 1;
    expect(mock.calls[lastMockCall][0]).toBe(newUserData.email);

    const message = mock.calls[lastMockCall][2];
    const codeConfirmation = findUUIDv4(message);
    await authTestHelper.confirmRegistration({ code: codeConfirmation });

    return user;
  }

  async me(
    accessToken: string,
    config: {
      expectedCode?: number;
    } = {},
  ) {
    const expectedCode = config.expectedCode ?? HttpStatus.OK;
    return request(this.app.getHttpServer())
      .get(this.globalPrefix + endpoints.me())
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(expectedCode);
  }

  async updateUser(
    accessToken: string,
    updateDto: Partial<UpdateUserDto>,
    config: {
      expectedCode?: number;
    } = {},
  ) {
    const expectedCode = config.expectedCode ?? HttpStatus.OK;
    return request(this.app.getHttpServer())
      .put(this.globalPrefix + endpoints.updateUser())
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updateDto)
      .expect(expectedCode);
  }
}
