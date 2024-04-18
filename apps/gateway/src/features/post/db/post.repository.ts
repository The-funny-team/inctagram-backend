import { Injectable } from '@nestjs/common';
import { PrismaService } from '@gateway/src/core/prisma/prisma.servise';
import { CreatePostDto } from '../dto/createPost.dto';

@Injectable()
export class PostRepository {
  constructor(private prismaService: PrismaService) {}

  async findById(id: string) {
    return this.prismaService.post.findUnique({ where: { id } });
  }

  async update(id: string, description: string) {
    return this.prismaService.post.update({
      where: { id },
      data: { description: description, updatedAt: new Date() },
    });
  }

  //TODO: if transation is ok this needs to be deleted
  async createPostWithImages(createDto: CreatePostDto, userId: string) {
    const images = createDto.images.map((image) => ({
      imageId: image,
    }));

    return this.prismaService.post.create({
      data: {
        description: createDto.description,
        authorId: userId,
        images: {
          createMany: {
            data: images,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return this.prismaService.post.delete({
      where: { id },
    });
  }
}
