import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.servise';
import { FileServiceAdapter, NotFoundError, Result } from '../../../core';
import { ResponsePostDto } from '@gateway/src/features/post/responses/responsePost.dto';
import { ERROR_POST_NOT_FOUND } from '@gateway/src/features/post/post.constants';
import { PostQueryDto } from '@gateway/src/features/post/dto/postQuery.dto';
import { FileInfoResponse } from '@libs/contracts';
import { PostsWhereClause } from '@gateway/src/features/post/types/postsWhereClause.type';
import { PostWhereClause } from '@gateway/src/features/post/types/postWhereClause.type';

@Injectable()
export class PostQueryRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly fileServiceAdapter: FileServiceAdapter,
  ) {}

  async getPostViewById(
    id: string,
    userId?: string,
  ): Promise<Result<ResponsePostDto>> {
    const whereClause: PostWhereClause = { id, isDeleted: false };

    if (userId) {
      whereClause.authorId = userId;
    }

    const post = await this.prismaService.post.findUnique({
      where: whereClause,
      include: { images: true },
    });

    if (!post) {
      return Result.Err(new NotFoundError(ERROR_POST_NOT_FOUND));
    }

    const ids = post.images.map((image) => image.imageId!);

    const result = await this.fileServiceAdapter.getFilesInfo(ids);
    if (!result.isSuccess) {
      return Result.Ok(ResponsePostDto.getView(post));
    }
    return Result.Ok(ResponsePostDto.getView(post, result.value));
  }

  async getPosts(
    query?: PostQueryDto,
    userId?: string,
  ): Promise<Result<ResponsePostDto[]>> {
    const whereClause: PostsWhereClause = { isDeleted: false };

    if (userId) {
      whereClause.authorId = userId;
    }

    const posts = await this.prismaService.post.findMany({
      where: whereClause,
      orderBy: { [query!.sortField!]: query!.sortDirection },
      skip: Number(query!.skip),
      take: Number(query!.take) || undefined,
      include: { images: true },
    });

    if (!posts.length) {
      return Result.Err(new NotFoundError(ERROR_POST_NOT_FOUND));
    }

    const imageIds = posts.flatMap((post) =>
      post.images.map((image) => image.imageId!),
    );

    const imagesData: Result<FileInfoResponse[]> =
      await this.fileServiceAdapter.getFilesInfo(imageIds);

    let mappedPostsView: ResponsePostDto[];

    if (!imagesData.isSuccess) {
      mappedPostsView = posts.map((post) => ResponsePostDto.getView(post));
    }

    mappedPostsView = posts.map((post) =>
      ResponsePostDto.getView(post, imagesData.value!),
    );

    return Result.Ok(mappedPostsView);
  }
}
