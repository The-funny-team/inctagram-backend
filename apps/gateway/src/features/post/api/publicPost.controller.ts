import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PostQueryRepository } from '@gateway/src/features/post/db/post.query.repository';
import { PostQueryDto } from '@gateway/src/features/post/dto/postQuery.dto';
import { GetPostsViewSwaggerDecorator } from '@gateway/src/core/swagger/post/getPostsView.swagger.decorator';
import { NotFoundError } from '@gateway/src/core';
import { ERROR_POST_NOT_FOUND } from '@gateway/src/features/post/post.constants';
import { GetPostViewSwaggerDecorator } from '@gateway/src/core/swagger/post/getPostView.swagger.decorator';
import { ResponsePostDto } from '@gateway/src/features/post/responses/responsePost.dto';

const baseUrl = '/public/post';

export const endpoints = {
  getPosts: () => `${baseUrl}`,
};

@ApiTags('Public Post')
@Controller('public/post')
export class PublicPostController {
  constructor(private readonly postQueryRepo: PostQueryRepository) {}

  @GetPostsViewSwaggerDecorator()
  @Get()
  async getPosts(@Query() query: PostQueryDto) {
    return this.getPostsView(query);
  }

  private async getPostsView(query: PostQueryDto) {
    const posts = await this.postQueryRepo.getPosts(query);

    if (!posts.isSuccess) {
      throw new NotFoundError(ERROR_POST_NOT_FOUND);
    }

    return posts.value;
  }

  @GetPostViewSwaggerDecorator()
  @Get(':id')
  async getPost(@Param('id') postId: string): Promise<ResponsePostDto> {
    return this.getPostView(postId);
  }

  private async getPostView(postId: string): Promise<ResponsePostDto> {
    const postViewResult = await this.postQueryRepo.getPostViewById(postId);

    if (!postViewResult.isSuccess) {
      throw postViewResult.err;
    }
    return postViewResult.value;
  }
}
