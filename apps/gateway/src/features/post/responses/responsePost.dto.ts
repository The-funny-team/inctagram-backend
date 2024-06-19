import { ApiProperty } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import { Post } from '@prisma/client';
import { FileInfoResponse } from '@libs/contracts';
import { ResponseAuthorDto } from '@gateway/src/features/post/responses/response-author.dto';
import { PageAbstractDto } from '@app/core/paging/pageing.dto';
import { PostQueryDto } from '@gateway/src/features/post/dto/postQuery.dto';

export class ResponsePostDto {
  @ApiProperty({
    description: 'post ID',
    type: 'string',
    example: uuidv4(),
  })
  id: string;

  @ApiProperty({ description: 'post content', type: 'string' })
  description: string;

  @ApiProperty({ description: 'authorId', type: ResponseAuthorDto })
  author: ResponseAuthorDto;

  @ApiProperty({
    description: 'creation date',
    type: 'string',
    example: new Date().toISOString(),
  })
  createdAt: string;

  @ApiProperty({
    description: 'update date',
    type: 'string',
    example: new Date().toISOString(),
  })
  updatedAt: string;

  @ApiProperty({ description: 'image id', type: 'string' })
  imagesUrl: string[];

  static getView(
    post: Post & { author: { id: string; name: string } },
    avatarsData?: FileInfoResponse,
    imagesData?: FileInfoResponse[],
  ): ResponsePostDto {
    let imagesDataForPost: FileInfoResponse[] | null = null;

    if (imagesData) {
      imagesDataForPost = imagesData.filter(
        (imageData) => imageData.ownerId === post.id,
      );
    }
    return {
      id: post.id,
      description: post.description,
      author: {
        id: post.author.id,
        name: post.author.name,
        avatarUrl: avatarsData?.url ?? null,
      },
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      imagesUrl: imagesDataForPost
        ? imagesDataForPost.map((imageData) => imageData.url)
        : [],
    };
  }
}

export class ResponsePostsViewDto extends PageAbstractDto<
  ResponsePostDto[],
  PostQueryDto
> {
  @ApiProperty({ type: [ResponsePostDto] })
  data: ResponsePostDto[];
}
