import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@gateway/src/core/prisma/prisma.servise';
import { AppModule } from '@gateway/src/app.module';
import { randomString } from '@gateway/test/e2e.tests/utils/tests.utils';
import { Post, User } from '@prisma/client';
import {
  DeletePostCommand,
  DeletePostUseCase,
} from '@gateway/src/features/post/application/use-cases/deletePost.usecase';
import {
  ERROR_NOT_PERMITTED,
  ERROR_POST_NOT_FOUND,
} from '@gateway/src/features/post/post.constants';
import { PostRepository } from '@gateway/src/features/post/db/post.repository';

describe('DeletePostUseCase', () => {
  let module: TestingModule;
  let prismaService: PrismaService;
  let useCase: DeletePostUseCase;
  let post: Post;
  let user: User;
  let postRepo: PostRepository;
  let fileServiceClient;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    useCase = module.get<DeletePostUseCase>(DeletePostUseCase);
    postRepo = module.get<PostRepository>(PostRepository);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    await module.close();
  });

  describe('execute', () => {
    it('should not delete post when post does not belong to user', async () => {
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

      const deleteResult = await useCase.execute(
        new DeletePostCommand(post.id, 'different_user.id'),
      );

      expect(deleteResult.err.message).toBe(ERROR_NOT_PERMITTED);

      const isPostExists = await prismaService.post.findUnique({
        where: { id: post.id },
      });

      expect(isPostExists).not.toBe(null);
    });

    it('should not delete post with wrong post id', async () => {
      const deleteResult = await useCase.execute(
        new DeletePostCommand('wrong post.id', user.id),
      );

      expect(deleteResult.err.message).toBe(ERROR_POST_NOT_FOUND);

      const isPostExists = await prismaService.post.findUnique({
        where: { id: post.id },
      });

      expect(isPostExists).not.toBe(null);
    });

    it('Should delete post', async () => {
      const mockPost = {
        id: 'postId',
        authorId: 'authorId',
        imageId: 'imageId',
      };

      const mockUser = { id: 'authorId' };

      fileServiceClient = {
        send: jest.fn(),
      };

      const findPostById = jest
        .spyOn(postRepo, 'findById')
        .mockReturnValueOnce(mockPost as any);

      jest
        .spyOn(prismaService, '$transaction')
        .mockReturnValueOnce(fileServiceClient);

      const deleteResult = await useCase.execute(
        new DeletePostCommand(mockPost.id, mockUser.id),
      );

      const findPosResponse = findPostById.mock.results[0].value;
      expect(postRepo.findById).toHaveBeenCalled();
      expect(findPosResponse).toEqual(mockPost);

      expect(prismaService.$transaction).toHaveBeenCalled();

      expect(deleteResult.isSuccess).toBe(true);

      expect(postRepo.findById).toHaveBeenCalledWith('postId');
      expect(prismaService.$transaction).toHaveBeenCalled();

      //TODO How can I check if the fileServiceClient.send has been called
      //expect(fileServiceClient.send).toHaveBeenCalled();
      // expect(fileServiceClient.send).toHaveBeenCalledWith(
      //   { cmd: 'delete_file' },
      //   { fileId: 'imageId' },
      // );
    });
  });
});
