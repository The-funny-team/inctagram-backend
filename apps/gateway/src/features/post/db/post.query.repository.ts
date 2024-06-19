import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.servise';
import { FileServiceAdapter, NotFoundError, Result } from '../../../core';
import { ResponsePostDto } from '@gateway/src/features/post/responses/responsePost.dto';
import { ERROR_POST_NOT_FOUND } from '@gateway/src/features/post/post.constants';
import { PostQueryDto } from '@gateway/src/features/post/dto/postQuery.dto';
import { FileInfoResponse } from '@libs/contracts';
import { PostsWhereClause } from '@gateway/src/features/post/types/postsWhereClause.type';
import { PostWhereClause } from '@gateway/src/features/post/types/postWhereClause.type';
import { PageDto } from '@app/core/paging/pageing.dto';

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
      include: {
        images: true,
        author: {
          select: { id: true, name: true, avatarId: true },
        },
      },
    });

    if (!post) {
      return Result.Err(new NotFoundError(ERROR_POST_NOT_FOUND));
    }

    const ids = post.images.map((image) => image.imageId!);

    const result = await this.fileServiceAdapter.getFilesInfo(ids);

    const avatarsData: Result<FileInfoResponse[]> | null = post.author.avatarId
      ? await this.fileServiceAdapter.getFilesInfo([post.author.avatarId])
      : null;

    if (!result.isSuccess) {
      return Result.Ok(ResponsePostDto.getView(post, avatarsData?.value?.[0]));
    }
    return Result.Ok(
      ResponsePostDto.getView(post, avatarsData?.value?.[0], result.value),
    );
  }

  async getPosts(
    query: PostQueryDto,
    userId?: string,
  ): Promise<
    Result<
      PageDto<ResponsePostDto[], Required<Pick<PostQueryDto, 'skip' | 'take'>>>
    >
  > {
    const whereClause: PostsWhereClause = { isDeleted: false };
    console.log(query);
    if (userId) {
      whereClause.authorId = userId;

      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return Result.Err(ERROR_POST_NOT_FOUND);
      }
    }

    const posts = await this.prismaService.post.findMany({
      where: whereClause,
      orderBy: { [query!.sortField!]: query!.sortDirection },
      skip: query.skip,
      take: query.take,
      include: {
        images: true,
        author: {
          select: { id: true, name: true, avatarId: true },
        },
      },
    });

    const totalCount = await this.prismaService.post.count({
      where: whereClause,
    });

    if (!posts.length) {
      return Result.Ok(
        new PageDto({
          data: [],
          totalCount,
          options: {
            skip: query.skip!,
            take: query.take!,
          },
        }),
      );
    }

    const imageIds = posts.flatMap((post) =>
      post.images.map((image) => image.imageId!),
    );

    const imagesData: Result<FileInfoResponse[]> =
      await this.fileServiceAdapter.getFilesInfo(imageIds);

    const avatarIds = posts
      .map((post) => post.author.avatarId)
      .filter(Boolean) as string[];

    const avatarsData: Result<FileInfoResponse[]> | null =
      avatarIds.length > 0
        ? await this.fileServiceAdapter.getFilesInfo(avatarIds)
        : null;

    let mappedPostsView: ResponsePostDto[];

    if (!imagesData.isSuccess) {
      mappedPostsView = posts.map((post, index) =>
        ResponsePostDto.getView(post, avatarsData?.value?.[index]),
      );
    }

    mappedPostsView = posts.map((post, index) =>
      ResponsePostDto.getView(
        post,
        avatarsData?.value?.[index],
        imagesData.value!,
      ),
    );

    return Result.Ok(
      new PageDto({
        data: mappedPostsView,
        totalCount,
        options: {
          skip: query.skip!,
          take: query.take!,
        },
      }),
    );
  }
}
