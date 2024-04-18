import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePostDto } from '@gateway/src/features/post/dto/updatePost.dto';
import { PostRepository } from '@gateway/src/features/post/db/post.repository';
import { Result } from '@gateway/src/core';
import { ForbiddenError, NotFoundError } from '@gateway/src/core';
import {
  ERROR_NOT_PERMITTED,
  ERROR_POST_NOT_FOUND,
} from '@gateway/src/features/post/post.constants';

export class UpdatePostCommand {
  constructor(
    public postId: string,
    public updatePostDto: UpdatePostDto,
    public userId: string,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(private postRepo: PostRepository) {}

  async execute(command: UpdatePostCommand) {
    const post = await this.postRepo.findById(command.postId);

    if (!post) {
      return Result.Err(new NotFoundError(ERROR_POST_NOT_FOUND));
    }

    if (command.userId !== post.authorId) {
      return Result.Err(new ForbiddenError(ERROR_NOT_PERMITTED));
    }

    const updatedPost = await this.postRepo.update(
      command.postId,
      command.updatePostDto.description,
    );

    return Result.Ok(updatedPost.id);
  }
}
