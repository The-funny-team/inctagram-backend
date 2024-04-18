import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '@gateway/src/features/post/db/post.repository';
import { BadGatewayError, FileServiceAdapter, Result } from '@gateway/src/core';
import { ForbiddenError, NotFoundError } from '@gateway/src/core';
import {
  ERROR_DELETE_POST,
  ERROR_NOT_PERMITTED,
  ERROR_POST_NOT_FOUND,
} from '@gateway/src/features/post/post.constants';
import { PrismaService } from '@gateway/src/core/prisma/prisma.servise';
import { Logger } from '@nestjs/common';
import { ERROR_DELETE_FILE } from '@gateway/src/core/adapters/fileService/fileService.constants';
import { PostImageRepository } from '@gateway/src/features/post/db/postImage.repository';
import { Post, PostImage } from '@prisma/client';

export class DeletePostCommand {
  constructor(
    public postId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  logger = new Logger(DeletePostUseCase.name);

  constructor(
    private readonly postRepo: PostRepository,
    private readonly postImageRepo: PostImageRepository,
    private readonly prismaService: PrismaService,
    private readonly fileServiceAdapter: FileServiceAdapter,
  ) {}

  async execute(command: DeletePostCommand) {
    const post: Post = await this.postRepo.findById(command.postId);

    if (!post) {
      return Result.Err(new NotFoundError(ERROR_POST_NOT_FOUND));
    }

    if (command.userId !== post.authorId) {
      return Result.Err(new ForbiddenError(ERROR_NOT_PERMITTED));
    }

    const postImages: PostImage[] = await this.postImageRepo.findByPostId(
      post.id,
    );

    const postImageIds = postImages.map((postImage) => {
      return postImage.imageId;
    });

    const deleteResult = await this.prismaService.$transaction(
      async (transactionClient) => {
        const deletePostResponse = await transactionClient.post.update({
          where: { id: command.postId },
          data: {
            isDeleted: true,
            images: {
              deleteMany: {}, //TODO: why set: [] did not work instead deleteMany (#Disconnect all related records)
            },
          },
        });

        if (!deletePostResponse) {
          throw new NotFoundError(ERROR_POST_NOT_FOUND);
        }

        const isPostImagesDeleted = await this.fileServiceAdapter.deleteFiles(
          postImageIds,
        );

        if (!isPostImagesDeleted.isSuccess) {
          throw new BadGatewayError(ERROR_DELETE_FILE);
        }

        return deletePostResponse;
      },
    );

    if (!deleteResult) {
      return Result.Err(new BadGatewayError(ERROR_DELETE_POST));
    }

    return Result.Ok();
  }
}
