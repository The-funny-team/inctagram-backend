import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@gateway/src/app.module';
import { EmailManagerModule } from '@gateway/src/core/email-manager/email-manager.module';
import { AuthTestHelper } from '@gateway/test/e2e.tests/testHelpers/auth.test.helper';
import {
  findUUIDv4,
  getAppForE2ETesting,
} from '@gateway/test/e2e.tests/utils/tests.utils';

import { LoginDto } from '@gateway/src/features/auth/dto/login.dto';
import { endpoints } from '@gateway/src/features/post/api/post.controller';
import {
  IPostTestHelper,
  PostTestHelper,
} from '@gateway/test/e2e.tests/testHelpers/post.test.helper';
import { BadGatewayError, FileServiceAdapter, Result } from '@gateway/src/core';
import { Post } from '@prisma/client';
import { PostQueryDto } from '@gateway/src/features/post/dto/postQuery.dto';
import { ERROR_GET_URLS_FILES } from '@gateway/src/core/adapters/fileService/fileService.constants';
import { EmailAdapter } from '@gateway/src/core/email-manager/email.adapter';
import { randomUUID } from 'crypto';
import { JwtAdapter } from '@gateway/src/core/jwt-adapter/jwt.adapter';

jest.setTimeout(15000);

describe('PostController (e2e) test', () => {
  let app: INestApplication;
  let authTestHelper: AuthTestHelper;
  let postTestHelper: IPostTestHelper;
  let fileServiceAdapter: FileServiceAdapter;
  let jwtAdapter: JwtAdapter;
  const posts: Post[] = [];

  const emailAdapterMock = {
    sendEmailConfirmationCode: jest.fn(),
    sendRecoveryPasswordTempCode: jest.fn(),
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

    jwtAdapter = testingModule.get<JwtAdapter>(JwtAdapter);

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

      const mock = emailAdapterMock.sendEmailConfirmationCode.mock;
      const lastMockCall = mock.calls.length - 1;

      const message = mock.calls[lastMockCall][0].token;
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

      const mock = emailAdapterMock.sendEmailConfirmationCode.mock;
      const lastMockCall = mock.calls.length - 1;

      const message = mock.calls[lastMockCall][0].token;
      const codeConfirmation = findUUIDv4(message);

      await authTestHelper.confirmRegistration({ code: codeConfirmation });

      const loginData = new LoginDto(userDto.email, userDto.password);

      deviceName = 'chrome';

      const tokenPairs = await authTestHelper.login(loginData, deviceName);

      accesTokenSecondUser = tokenPairs.body.accessToken;
    });

    it(`${endpoints.createPost()} (POST) Should create post with images`, async () => {
      for (let i = 0; i < 5; i++) {
        jest
          .spyOn(fileServiceAdapter, 'updateOwnerId')
          .mockReturnValueOnce(Result.Ok() as any);

        jest.spyOn(fileServiceAdapter, 'getFilesInfo').mockReturnValueOnce(
          Result.Ok([
            {
              ownerId: 'ownerId',
              url: 'url',
            },
          ]) as any,
        );

        const createPostDto = postTestHelper.postDto();

        const createdPost = await postTestHelper.createPost(
          accessToken,
          // Проверка на пустое описание первово созданного поста
          i === 0 ? { ...createPostDto, description: '' } : createPostDto,
          {
            expectedCode: HttpStatus.CREATED,
          },
        );
        posts.push(createdPost.body);
      }

      post = posts[4];
    });

    it('should get post by id', async () => {
      jest.spyOn(fileServiceAdapter, 'getFilesInfo').mockReturnValueOnce(
        Result.Ok([
          {
            ownerId: post.id,
            url: 'url',
          },
        ]) as any,
      );
      await postTestHelper.getPostById(post.id);
    });

    it('should get last 4 created posts', async () => {
      const query: PostQueryDto = {
        sortDirection: 'desc',
        sortField: 'createdAt',
        skip: 0,
        take: 4,
      };

      jest.spyOn(fileServiceAdapter, 'getFilesInfo').mockReturnValueOnce(
        Result.Ok([
          {
            ownerId: post.id,
            url: 'url',
          },
        ]) as any,
      );

      const posts = await postTestHelper.getPosts(query);

      expect(posts.body.length).toBe(4);
      expect(posts.body[0].id).toBe(post.id);
      expect(posts.body[0].imagesUrl[0]).toEqual('url');
    });

    it('should get all created posts with no query parameter', async () => {
      jest.spyOn(fileServiceAdapter, 'getFilesInfo').mockReturnValueOnce(
        Result.Ok([
          {
            ownerId: post.id,
            url: 'url',
          },
        ]) as any,
      );

      const posts = await postTestHelper.getPosts();

      expect(posts.body.length).not.toBe(4);
    });

    it('should get all created posts by user id', async () => {
      jest.spyOn(fileServiceAdapter, 'getFilesInfo').mockReturnValueOnce(
        Result.Ok([
          {
            ownerId: post.id,
            url: 'url',
          },
        ]) as any,
      );

      const posts = await postTestHelper.getPosts({}, post.authorId);

      expect(posts.body.length).not.toBe(4);
    });

    it('should get empty posts by user id', async () => {
      const { userId } = jwtAdapter.decodeToken(accesTokenSecondUser);

      expect(userId).not.toBeUndefined();

      jest.spyOn(fileServiceAdapter, 'getFilesInfo').mockReturnValueOnce(
        Result.Ok([
          {
            ownerId: userId,
            url: 'url',
          },
        ]) as any,
      );

      const posts = await postTestHelper.getPosts({}, userId);

      expect(posts.body.length).toBe(0);
    });

    it('should get error if get posts by invalid user id', async () => {
      jest.spyOn(fileServiceAdapter, 'getFilesInfo').mockReturnValueOnce(
        Result.Ok([
          {
            ownerId: post.id,
            url: 'url',
          },
        ]) as any,
      );

      await postTestHelper.getPosts({}, randomUUID(), {
        expectedCode: HttpStatus.NOT_FOUND,
      });
    });

    it('should get last 4 created posts without image data', async () => {
      const query: PostQueryDto = {
        sortDirection: 'desc',
        sortField: 'createdAt',
        skip: 0,
        take: 4,
      };

      jest
        .spyOn(fileServiceAdapter, 'getFilesInfo')
        .mockReturnValueOnce(
          Result.Err(new BadGatewayError(ERROR_GET_URLS_FILES)) as any,
        );

      const posts = await postTestHelper.getPosts(query);

      console.log('post id', post);

      expect(posts.body.length).toBe(4);
      expect(posts.body[0].id).toBe(post.id);
      expect(posts.body[0].imagesUrl).toEqual([]);
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
