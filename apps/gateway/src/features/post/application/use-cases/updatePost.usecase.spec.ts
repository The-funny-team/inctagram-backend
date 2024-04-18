import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@gateway/src/core/prisma/prisma.servise';
import { AppModule } from '@gateway/src/app.module';
import { UpdatePostDto } from '@gateway/src/features/post/dto/updatePost.dto';
import {
  UpdatePostCommand,
  UpdatePostUseCase,
} from '@gateway/src/features/post/application/use-cases/updatePost.usecase';
import { randomString } from '@gateway/test/e2e.tests/utils/tests.utils';
import { Post, User } from '@prisma/client';
import {
  ERROR_NOT_PERMITTED,
  ERROR_POST_NOT_FOUND,
} from '@gateway/src/features/post/post.constants';

describe('UpdatePostUseCase', () => {
  let module: TestingModule;
  let prismaService: PrismaService;
  let useCase: UpdatePostUseCase;
  let payload: UpdatePostDto;
  let user: User;
  let post: Post;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    useCase = module.get<UpdatePostUseCase>(UpdatePostUseCase);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    await module.close();
  });

  describe('execute', () => {
    it('should update post description', async () => {
      const userDto = {
        name: randomString(10),
        email: `${randomString(6)}@test.com`,
        hashPassword: '12345',
      };

      user = await prismaService.user.create({ data: userDto });

      const postDto = {
        description: 'new post created',
        authorId: user.id,
        createdAt: new Date(),
      };

      post = await prismaService.post.create({ data: postDto });

      payload = {
        description: 'post updated',
      };

      const updateResult = await useCase.execute(
        new UpdatePostCommand(post.id, payload, user.id),
      );

      expect(updateResult.isSuccess).toBe(true);

      const updatedPost = await prismaService.post.findUnique({
        where: { id: post.id },
      });

      expect(updatedPost.description).toEqual('post updated');
    });

    it('should not update post description with wrong post id', async () => {
      const updateResult = await useCase.execute(
        new UpdatePostCommand('dfddf', payload, user.id),
      );

      expect(updateResult.isSuccess).toBe(false);
      expect(updateResult.err.message).toBe(ERROR_POST_NOT_FOUND);
    });

    it('should not update post when post does not belong to current user', async () => {
      const updateResult = await useCase.execute(
        new UpdatePostCommand(post.id, payload, 'dddd'),
      );

      expect(updateResult.isSuccess).toBe(false);
      expect(updateResult.err.message).toBe(ERROR_NOT_PERMITTED);
    });
  });
});
