import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { EmailManagerModule } from '../../src/core/email-manager/email-manager.module';
import { EmailAdapter } from '../../src/infrastructure';
import { AuthTestHelper } from './testHelpers/auth.test.helper';
import { getAppForE2ETesting, randomString } from './utils/tests.utils';
import { UserTestHelper } from './testHelpers/user.test.helper';
import { ResponseUserDto } from '@gateway/src/features/user/responses';
import { CreateUserDto } from '@gateway/src/features/user/dto';
import { endpoints } from '@gateway/src/features/user/api/user.controller';
import { subYears } from 'date-fns';
import { LoginDto } from '@gateway/src/features/auth/dto/login.dto';

jest.setTimeout(15000);

describe('UserController (e2e) test', () => {
  let app: INestApplication;
  let authTestHelper: AuthTestHelper;
  let userTestHelper: UserTestHelper;
  let newUserData: CreateUserDto;
  let user: ResponseUserDto;

  const deviceName = 'test device';
  let loginDto: LoginDto;

  const emailAdapterMock = {
    sendEmail: jest.fn(),
  };

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      imports: [EmailManagerModule, AppModule],
    })
      .overrideProvider(EmailAdapter)
      .useValue(emailAdapterMock)
      .compile();

    app = await getAppForE2ETesting(testingModule);

    authTestHelper = new AuthTestHelper(app);
    userTestHelper = new UserTestHelper(app);

    newUserData = authTestHelper.userDto();
    user = await userTestHelper.createRegisteredAndVerifiedUser(
      newUserData,
      authTestHelper,
      emailAdapterMock,
    );
    loginDto = new LoginDto(newUserData.email, newUserData.password);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Me', () => {
    it(`${endpoints.me()} (GET) - get profile correct data`, async () => {
      const resTokens = await authTestHelper.login(loginDto, deviceName);
      const accessToken = resTokens.body.accessToken;
      const { body } = await userTestHelper.me(accessToken);

      const expectedBody: ResponseUserDto = {
        id: expect.any(String),
        username: newUserData.username,
        email: newUserData.email,
        firstName: null,
        lastName: null,
        dateOfBirth: null,
        country: null,
        city: null,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        aboutMe: null,
        avatarUrl: null,
      };

      expect(body).toEqual(expectedBody);
    });

    it(`${endpoints.me()} (GET) - Unauthorized`, async () => {
      await userTestHelper.me('', {
        expectedCode: HttpStatus.UNAUTHORIZED,
      });
    });
  });

  describe('updateUser', () => {
    it(`${endpoints.updateUser()} (PUT) - update user correct data`, async () => {
      const resTokens = await authTestHelper.login(loginDto, deviceName);
      const accessToken = resTokens.body.accessToken;

      const updateUserDto = {
        username: user.username + '1',
        firstName: 'Ivan',
        lastName: 'Ivanov',
        dateOfBirth: subYears(new Date(), 15),
        country: randomString(10),
        city: randomString(10),
        aboutMe: randomString(10),
      };

      const { body } = await userTestHelper.updateUser(
        accessToken,
        updateUserDto,
      );
      const expectedBody: ResponseUserDto = {
        id: expect.any(String),
        username: updateUserDto.username,
        email: newUserData.email,
        firstName: updateUserDto.firstName,
        lastName: updateUserDto.lastName,
        dateOfBirth: expect.any(String),
        country: updateUserDto.country,
        city: updateUserDto.city,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        aboutMe: updateUserDto.aboutMe,
        avatarUrl: null,
      };

      expect(body).toEqual(expectedBody);
    });

    it(`${endpoints.updateUser()} (PUT) - Unauthorized`, async () => {
      await userTestHelper.updateUser(
        '',
        {},
        {
          expectedCode: HttpStatus.UNAUTHORIZED,
        },
      );
    });
  });
});
