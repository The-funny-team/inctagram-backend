import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@gateway/src/app.module';
import { EmailManagerModule } from '@gateway/src/core/email-manager/email-manager.module';
import { EmailAdapter } from '@gateway/src/infrastructure';
import { AuthTestHelper } from '@gateway/test/e2e.tests/testHelpers/auth.test.helper';
import {
  findUUIDv4,
  getAppForE2ETesting,
  getErrorMessagesBadRequest,
} from '@gateway/test/e2e.tests/utils/tests.utils';

import { LoginDto } from '@gateway/src/features/auth/dto/login.dto';
import { endpoints } from '@gateway/src/features/post/api/post.controller';
import { PostTestHelper } from '@gateway/test/e2e.tests/testHelpers/post.test.helper';
import { FileServiceAdapter, Result } from '@gateway/src/core';
import { Post } from '@prisma/client';

jest.setTimeout(15000);

const errorMessagesBadRequest = getErrorMessagesBadRequest();

describe('PostController (e2e) test', () => {
  let app: INestApplication;
  let authTestHelper: AuthTestHelper;
  let postTestHelper: PostTestHelper;
  let fileServiceAdapter: FileServiceAdapter;

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

    fileServiceAdapter =
      testingModule.get<FileServiceAdapter>(FileServiceAdapter);

    app = await getAppForE2ETesting(testingModule);

    authTestHelper = new AuthTestHelper(app);
    postTestHelper = new PostTestHelper(app);
  });

  beforeEach(async () => {});

  afterEach(async () => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Deleting post with images', () => {
    let deviceName;
    let accessToken: string;
    let accesTokenSecondUser: string;
    let post: Post;

    it(`(POST) Creating new user and login`, async () => {
      const userDto = authTestHelper.userDto();

      await authTestHelper.registrationUser(userDto);
      await new Promise((pause) => setTimeout(pause, 100));

      const mock = emailAdapterMock.sendEmail.mock;
      const lastMockCall = mock.calls.length - 1;

      const message = mock.calls[lastMockCall][2];
      const codeConfirmation = findUUIDv4(message);

      await authTestHelper.confirmRegistration({ code: codeConfirmation });

      const loginData = new LoginDto(userDto.email, userDto.password);

      deviceName = 'chrome';

      const tokenPairs = await authTestHelper.login(loginData, deviceName);

      accessToken = tokenPairs.body.accessToken;
    });

    it(`(POST) Creating second user and login`, async () => {
      const userDto = authTestHelper.userDto();

      await authTestHelper.registrationUser(userDto);
      await new Promise((pause) => setTimeout(pause, 100));

      const mock = emailAdapterMock.sendEmail.mock;
      const lastMockCall = mock.calls.length - 1;

      const message = mock.calls[lastMockCall][2];
      const codeConfirmation = findUUIDv4(message);

      await authTestHelper.confirmRegistration({ code: codeConfirmation });

      const loginData = new LoginDto(userDto.email, userDto.password);

      deviceName = 'chrome';

      const tokenPairs = await authTestHelper.login(loginData, deviceName);

      accesTokenSecondUser = tokenPairs.body.accessToken;
    });

    it(`${endpoints.createPost()} (POST) Should create post with images`, async () => {
      jest
        .spyOn(fileServiceAdapter, 'updateOwnerId')
        .mockReturnValueOnce(Result.Ok() as any);

      jest
        .spyOn(fileServiceAdapter, 'getFilesInfo')
        .mockReturnValueOnce(Result.Ok('url') as any);

      const createPostDto = postTestHelper.postDto();
      const createdPost = await postTestHelper.createPost(
        accessToken,
        createPostDto,
        {
          expectedCode: HttpStatus.CREATED,
        },
      );

      post = createdPost.body;
    });

    it(`${endpoints.deletePost(
      'id',
    )} (POST) Should not delete post with images with wrong postId`, async () => {
      jest
        .spyOn(fileServiceAdapter, 'deleteFiles')
        .mockReturnValueOnce(Result.Ok() as any);
      await postTestHelper.deletePost(accessToken, 'wrong_id', {
        expectedCode: HttpStatus.NOT_FOUND,
      });
    });

    it(`${endpoints.deletePost(
      'id',
    )} (POST) Other user should not delete post that do not belong him`, async () => {
      jest
        .spyOn(fileServiceAdapter, 'deleteFiles')
        .mockReturnValueOnce(Result.Ok() as any);
      await postTestHelper.deletePost(accesTokenSecondUser, post.id, {
        expectedCode: HttpStatus.FORBIDDEN,
      });
    });

    it(`${endpoints.deletePost(
      'id',
    )} (POST) Should delete post with images`, async () => {
      jest
        .spyOn(fileServiceAdapter, 'deleteFiles')
        .mockReturnValueOnce(Result.Ok() as any);
      await postTestHelper.deletePost(accessToken, post.id, {
        expectedCode: HttpStatus.NO_CONTENT,
      });
    });
  });
});
