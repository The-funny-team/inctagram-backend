import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostDto } from '../../dto/createPost.dto';
import { PostRepository } from '../../db/post.repository';
import { Post } from '@prisma/client';
import { BadGatewayError, FileServiceAdapter, Result } from '@gateway/src/core';
import { PrismaService } from '@gateway/src/core/prisma/prisma.servise';
import { ERROR_UPDATE_OWNWER_ID_FILE } from '@gateway/src/core/adapters/fileService/fileService.constants';

export class CreatePostCommand {
  constructor(
    public createDto: CreatePostDto,
    public userId: string,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private readonly postRepo: PostRepository,
    private readonly fileServiceAdapter: FileServiceAdapter,
    private readonly prismaService: PrismaService,
  ) {}

  async execute({
    createDto,
    userId,
  }: CreatePostCommand): Promise<Result<Post>> {
    //TODO - тут нужна транзакция

    const createdPost = await this.prismaService.$transaction(
      async (transactionClient) => {
        const images = createDto.images.map((image) => ({
          imageId: image,
        }));

        const post = await transactionClient.post.create({
          data: {
            description: createDto.description,
            authorId: userId,
            images: {
              createMany: {
                data: images,
              },
            },
          },
        });

        const updateResult = await this.fileServiceAdapter.updateOwnerId(
          createDto.images,
          post.id,
        );

        if (!updateResult.isSuccess) {
          throw new BadGatewayError(ERROR_UPDATE_OWNWER_ID_FILE);
        }
        return post;
      },
    );
    return Result.Ok(createdPost);
  }
}
