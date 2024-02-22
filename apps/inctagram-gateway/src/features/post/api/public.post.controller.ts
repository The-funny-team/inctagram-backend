import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PostQueryRepository } from '@gateway/src/features/post/db/post.query.repository';
import { PostQueryDto } from '@gateway/src/features/post/dto/postQuery.dto';
import { ResponsePostDto } from '@gateway/src/features/post/responses/responsePost.dto';
import { GetPostsViewSwaggerDecorator } from '@gateway/src/core/swagger/post/getPostsView.swagger.decorator';

const baseUrl = '/public/post';

export const endpoints = {
  getPosts: () => `${baseUrl}`,
};

@ApiTags('public/post')
@ApiBearerAuth()
@Controller('public/post')
export class PublicPostController {
  constructor(private readonly postQueryRepo: PostQueryRepository) {}

  @GetPostsViewSwaggerDecorator() //TODO:need to change ResponsePostDto
  @Get()
  async getPosts(@Query() query: PostQueryDto): Promise<ResponsePostDto> {
    return this.getPostsView(query);
  }

  private async getPostsView(query: PostQueryDto): Promise<ResponsePostDto> {
    const postViewResult = await this.postQueryRepo.getPosts(query);

    if (!postViewResult.isSuccess) {
      throw postViewResult.err;
    }
    return postViewResult[0].value;
  }
}
