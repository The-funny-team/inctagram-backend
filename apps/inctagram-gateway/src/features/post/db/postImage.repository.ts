import { Injectable } from '@nestjs/common';
import { PrismaService } from '@gateway/src/core/prisma/prisma.servise';
import { PostImage } from '@prisma/client';

@Injectable()
export class PostImageRepository {
  constructor(private prismaService: PrismaService) {}

  async findByPostId(postId: string): Promise<PostImage[]> {
    return this.prismaService.postImage.findMany({ where: { postId } });
  }
}
