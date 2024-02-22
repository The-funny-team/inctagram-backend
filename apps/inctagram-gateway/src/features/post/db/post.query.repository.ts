import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.servise';
import { FileServiceAdapter, NotFoundError, Result } from '../../../core';
import { ResponsePostDto } from '@gateway/src/features/post/responses/responsePost.dto';
import { ERROR_POST_NOT_FOUND } from '@gateway/src/features/post/post.constants';
import { Post } from '@prisma/client';
import { PostQueryDto } from '@gateway/src/features/post/dto/postQuery.dto';

@Injectable()
export class PostQueryRepository {
  private logger = new Logger(PostQueryRepository.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly fileServiceAdapter: FileServiceAdapter,
  ) {}

  async getPostViewById(
    id: string,
    userId: string,
  ): Promise<Result<ResponsePostDto>> {
    const post = await this.prismaService.post.findUnique({
      where: { id, isDeleted: false, authorId: userId },
      include: { images: true },
    });

    if (!post) {
      return Result.Err(new NotFoundError(ERROR_POST_NOT_FOUND));
    }

    const ids = post.images.map((image) => image.imageId);

    const result = await this.fileServiceAdapter.getFilesInfo(ids);
    if (!result.isSuccess) {
      return Result.Ok(ResponsePostDto.getView(post));
    }

    return Result.Ok(ResponsePostDto.getView(post, result.value.urls));
  }

  async getPosts(query: PostQueryDto) {
    const posts: Post[] = await this.prismaService.post.findMany({
      orderBy: { [query.sortField]: query.sortDirection },
      skip: query.skip,
      take: query.take,
    });

    if (!posts.length) {
      return Result.Err(new NotFoundError(ERROR_POST_NOT_FOUND));
    }

    return Result.Ok(posts);
  }
}
