import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { EmailManagerModule } from '../../src/core/email-manager/email-manager.module';
import { EmailAdapter } from '../../src/infrastructure';
import { AuthTestHelper } from './testHelpers/auth.test.helper';
import {
  findUUIDv4,
  getAppForE2ETesting,
  getErrorMessagesBadRequest,
  randomString,
} from './utils/tests.utils';
import { endpoints } from '../../src/features/auth/api';
import { ResponseUserDto } from '../../src/features/user/responses';
import {
  ERROR_EMAIL_IS_ALREADY_REGISTRED,
  ERROR_FORMAT_EMAIL,
  ERROR_LENGTH_PASSWORD,
  ERROR_LENGTH_USERNAME,
  ERROR_PASSWORD_MUST_CONTAIN,
  ERROR_PASSWORDS_MUST_MATCH,
} from '../../src/features/user/user.constants';

jest.setTimeout(15000);

const errorMessagesBadRequest = getErrorMessagesBadRequest();

describe('AuthController (e2e) test', () => {
  let app: INestApplication;
  let authTestHelper: AuthTestHelper;

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
  });

  beforeEach(async () => {});

  afterEach(async () => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Registration new user to the system', () => {
    it(`${endpoints.registration()} (POST) - registration the user with correct data'`, async () => {
      const userDto = authTestHelper.userDto();

      const { body } = await authTestHelper.registrationUser(userDto);
      const expectedBody: ResponseUserDto = {
        id: expect.any(String),
        username: userDto.username,
        email: userDto.email,
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

      await new Promise((pause) => setTimeout(pause, 100));

      expect(emailAdapterMock.sendEmail).toHaveBeenCalled();
      expect(emailAdapterMock.sendEmail.mock.calls[0][0]).toBe(userDto.email);
    });
    it(`${endpoints.registration()} (POST) - registration the user incorrect username'`, async () => {
      const userDto = authTestHelper.userDto();
      userDto.username = 'a';

      errorMessagesBadRequest.message[0].field = 'username';
      errorMessagesBadRequest.message[0].message = ERROR_LENGTH_USERNAME;

      let body = (
        await authTestHelper.registrationUser(userDto, {
          expectedCode: HttpStatus.BAD_REQUEST,
        })
      ).body;
      expect(body).toEqual(errorMessagesBadRequest);

      userDto.username = 'test';
      body = (
        await authTestHelper.registrationUser(userDto, {
          expectedCode: HttpStatus.BAD_REQUEST,
        })
      ).body;
      expect(body).toEqual(errorMessagesBadRequest);

      userDto.username = randomString(31);
      body = (
        await authTestHelper.registrationUser(userDto, {
          expectedCode: HttpStatus.BAD_REQUEST,
        })
      ).body;
      expect(body).toEqual(errorMessagesBadRequest);
    });
    it(`${endpoints.registration()} (POST) - registration the user incorrect email'`, async () => {
      const userDto = authTestHelper.userDto();
      userDto.email = 'test';

      errorMessagesBadRequest.message[0].field = 'email';
      errorMessagesBadRequest.message[0].message = ERROR_FORMAT_EMAIL;

      const body = (
        await authTestHelper.registrationUser(userDto, {
          expectedCode: HttpStatus.BAD_REQUEST,
        })
      ).body;
      expect(body).toEqual(errorMessagesBadRequest);
    });
    it(`${endpoints.registration()} (POST) - registration the user incorrect password'`, async () => {
      const userDto = authTestHelper.userDto();

      errorMessagesBadRequest.message[0].field = 'password';
      errorMessagesBadRequest.message[0].message = ERROR_LENGTH_PASSWORD;

      userDto.password = 'tE1!';
      userDto.passwordConfirm = userDto.password;

      let body = (
        await authTestHelper.registrationUser(userDto, {
          expectedCode: HttpStatus.BAD_REQUEST,
        })
      ).body;
      expect(body).toEqual(errorMessagesBadRequest);

      userDto.password = randomString(21) + 'A!0';
      userDto.passwordConfirm = userDto.password;
      body = (
        await authTestHelper.registrationUser(userDto, {
          expectedCode: HttpStatus.BAD_REQUEST,
        })
      ).body;
      expect(body).toEqual(errorMessagesBadRequest);

      userDto.password = 'aaaaaa';
      userDto.passwordConfirm = userDto.password;

      errorMessagesBadRequest.message[0].field = 'password';
      errorMessagesBadRequest.message[0].message = ERROR_PASSWORD_MUST_CONTAIN;

      body = (
        await authTestHelper.registrationUser(userDto, {
          expectedCode: HttpStatus.BAD_REQUEST,
        })
      ).body;
      expect(body).toEqual(errorMessagesBadRequest);
    });
    it(`${endpoints.registration()} (POST) - registration the user incorrect passwordConfirm'`, async () => {
      const userDto = authTestHelper.userDto();
      userDto.passwordConfirm = '';

      errorMessagesBadRequest.message[0].field = 'passwordConfirm';
      errorMessagesBadRequest.message[0].message = ERROR_PASSWORDS_MUST_MATCH;

      const body = (
        await authTestHelper.registrationUser(userDto, {
          expectedCode: HttpStatus.BAD_REQUEST,
        })
      ).body;
      expect(body).toEqual(errorMessagesBadRequest);
    });
    it(`${endpoints.registration()} (POST) - User with this email is already registered'`, async () => {
      const userDto = authTestHelper.userDto();

      await authTestHelper.registrationUser(userDto);

      userDto.username = randomString(10);
      const { body } = await authTestHelper.registrationUser(userDto, {
        expectedCode: HttpStatus.BAD_REQUEST,
      });

      errorMessagesBadRequest.message[0].field = 'email';
      errorMessagesBadRequest.message[0].message =
        ERROR_EMAIL_IS_ALREADY_REGISTRED;

      expect(body).toEqual(errorMessagesBadRequest);

      await new Promise((pause) => setTimeout(pause, 100));

      expect(emailAdapterMock.sendEmail).toHaveBeenCalled();
      const mock = emailAdapterMock.sendEmail.mock;
      const callWithCurrentEmail = mock.calls.filter((call) => {
        return call[0] === userDto.email;
      });
      expect(callWithCurrentEmail.length).toBe(1);
    });
  });

  describe('Confirmation user', () => {
    it(`${endpoints.registrationConfirmation} (POST) confirmation code correct data`, async () => {
      const userDto = authTestHelper.userDto();

      await authTestHelper.registrationUser(userDto);
      await new Promise((pause) => setTimeout(pause, 100));

      expect(emailAdapterMock.sendEmail).toHaveBeenCalled();
      const mock = emailAdapterMock.sendEmail.mock;
      const lastMockCall = mock.calls.length - 1;
      expect(mock.calls[lastMockCall][0]).toBe(userDto.email);

      const message = mock.calls[lastMockCall][2];
      const codeConfirmation = findUUIDv4(message);

      expect(codeConfirmation.length).not.toBe(0);

      await authTestHelper.confirmRegistration({ code: codeConfirmation });
    });
    it(`${endpoints.registrationConfirmation} (POST) confirmation code incorrect data`, async () => {
      await authTestHelper.confirmRegistration(
        { code: '' },
        { expectedCode: HttpStatus.BAD_REQUEST },
      );
    });
  });

  describe('Unauthorized user did not receive link to email', () => {
    it(`${endpoints.registration()} (POST) - resend verification code`, async () => {
      const userDto = authTestHelper.userDto();

      await authTestHelper.registrationUser(userDto);
      await authTestHelper.registrationUser(userDto);

      await new Promise((pause) => setTimeout(pause, 100));

      expect(emailAdapterMock.sendEmail).toHaveBeenCalled();
      expect(emailAdapterMock.sendEmail.mock.lastCall[0]).toBe(userDto.email);

      const mock = emailAdapterMock.sendEmail.mock;
      const callWithCurrentEmail = mock.calls.filter((call) => {
        return call[0] === userDto.email;
      });
      expect(callWithCurrentEmail.length).toBe(2);
    });
  });
});
