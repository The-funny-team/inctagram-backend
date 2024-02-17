import { Module } from '@nestjs/common';
import { PostController } from '@gateway/src/features/post/api/post.controller';
import { PostRepository } from '@gateway/src/features/post/db/post.repository';
import { POST_USE_CASE } from '@gateway/src/features/post/application/use-cases';
import { CqrsModule } from '@nestjs/cqrs';
import { PostQueryRepository } from '@gateway/src/features/post/db/post.query.repository';
import {
  FileServiceAdapter,
  getClientFileServiceConfig,
} from '@gateway/src/core';
import { ClientsModule } from '@nestjs/microservices';
import { PostImageRepository } from '@gateway/src/features/post/db/postImage.repository';

@Module({
  imports: [
    CqrsModule,
    ClientsModule.registerAsync([getClientFileServiceConfig()]),
  ],
  controllers: [PostController],
  providers: [
    PostRepository,
    PostImageRepository,
    ...POST_USE_CASE,
    PostQueryRepository,
    FileServiceAdapter,
  ],
})
export class PostModule {}
