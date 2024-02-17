import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostDto } from '../../dto/createPost.dto';
import { PostRepository } from '../../db/post.repository';
import { Post } from '@prisma/client';
import { FileServiceAdapter, Result } from '@gateway/src/core';

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
  ) {}

  async execute({
    createDto,
    userId,
  }: CreatePostCommand): Promise<Result<Post>> {
    //TODO - тут нужна транзакция
    const post = await this.postRepo.createPostWithImages(createDto, userId);

    const updateResult = await this.fileServiceAdapter.updateOwnerId(
      createDto.images,
      post.id,
    );
    if (!updateResult.isSuccess) {
      return Result.Err<Post>(updateResult.err);
    }

    return Result.Ok(post);
  }
}
