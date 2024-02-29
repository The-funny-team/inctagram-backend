import { ApiProperty } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import { Post } from '@prisma/client';
import { FileInfoResponse } from '@libs/contracts';

export class ResponsePostDto {
  @ApiProperty({
    description: 'post ID',
    type: 'string',
    example: uuidv4(),
  })
  id: string;

  @ApiProperty({ description: 'post content', type: 'string' })
  description: string;

  @ApiProperty({ description: 'authorId', type: 'string' })
  authorId: string;

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

  static getView(post: Post, imagesData?: FileInfoResponse[]): ResponsePostDto {
    const imagesDataForPost: FileInfoResponse[] = imagesData.filter(
      (imageData) => imageData.ownerId === post.id,
    );

    return {
      id: post.id,
      description: post.description,
      authorId: post.authorId,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      imagesUrl: imagesDataForPost
        ? imagesDataForPost.map((imageData) => imageData.url)
        : [],
    };
  }
}
