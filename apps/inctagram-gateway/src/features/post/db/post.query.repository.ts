import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.servise';
import { NotFoundError, Result } from '../../../core';
import { ResponsePostDto } from '@gateway/src/features/post/responses/responsePost.dto';
import { ERROR_POST_NOT_FOUND } from '@gateway/src/features/post/post.constants';
import { firstValueFrom, timeout } from 'rxjs';
import { FileUrlResponse } from '@libs/contracts';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PostQueryRepository {
  private logger = new Logger(PostQueryRepository.name);

  constructor(
    private readonly prismaService: PrismaService,
    @Inject('FILE_SERVICE') private readonly fileServiceClient: ClientProxy,
  ) {}

  async getPostViewById(id: string): Promise<Result<ResponsePostDto>> {
    const post = await this.prismaService.post.findUnique({
      where: { id, isDeleted: false },
    });

    if (!post) {
      return Result.Err(new NotFoundError(ERROR_POST_NOT_FOUND));
    }

    if (!post.imageId) {
      return Result.Ok(ResponsePostDto.getView(post));
    }

    try {
      const responseOfService = this.fileServiceClient
        .send({ cmd: 'get_file_url' }, { fileId: post.imageId })
        .pipe(timeout(10000));
      const imageUrl: FileUrlResponse = await firstValueFrom(responseOfService);
      return Result.Ok(ResponsePostDto.getView(post, imageUrl.url));
    } catch (error) {
      this.logger.log(`userId: ${id} - ${error}`);
      return Result.Ok(ResponsePostDto.getView(post));
    }
  }
}
