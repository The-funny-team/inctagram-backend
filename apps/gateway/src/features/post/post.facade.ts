import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { UpdatePostDto } from '@gateway/src/features/post/dto/updatePost.dto';
import { Result } from '../../core/result';
import { UpdatePostCommand } from '@gateway/src/features/post/application/use-cases/updatePost.usecase';

@Injectable()
export class PostFacade {
  constructor(private commandBus: CommandBus) {}

  repository = {};

  useCases = {
    updatePost: (
      postId: string,
      updatePostDto: UpdatePostDto,
      userId: string,
    ) => this.updatePost(postId, updatePostDto, userId),
  };
  // queries = { getUserViewById: (id: string) => this.getUserViewById(id) };

  private async updatePost(
    postId: string,
    updatePostDto: UpdatePostDto,
    userId: string,
  ): Promise<Result<string>> {
    return this.commandBus.execute<UpdatePostCommand, Result<string>>(
      new UpdatePostCommand(postId, updatePostDto, userId),
    );
  }
}
