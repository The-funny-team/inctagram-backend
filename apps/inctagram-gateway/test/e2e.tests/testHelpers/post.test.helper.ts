import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getGlobalPrefix, randomString } from '../utils/tests.utils';
import { CreatePostDto } from '@gateway/src/features/post/dto/createPost.dto';
import { endpoints } from '@gateway/src/features/post/api/post.controller';

export class PostTestHelper {
  globalPrefix = getGlobalPrefix();
  constructor(private app: INestApplication) {}

  postDto(): CreatePostDto {
    return {
      description: randomString(20),
      images: [
        randomString(5),
        randomString(5),
        randomString(5),
        randomString(5),
        randomString(5),
      ],
    };
  }

  async createPost(
    accessToken,
    createPostDto,
    config: {
      expectedCode?: number;
    } = {},
  ) {
    const expectedCode = config.expectedCode ?? HttpStatus.OK;

    return request(this.app.getHttpServer())
      .post(this.globalPrefix + endpoints.createPost())
      .send(createPostDto)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(expectedCode);
  }
  async deletePost(
    accessToken,
    postId: string,
    config: {
      expectedCode?: number;
    } = {},
  ) {
    const expectedCode = config.expectedCode ?? HttpStatus.OK;

    return request(this.app.getHttpServer())
      .delete(this.globalPrefix + endpoints.deletePost(postId))
      .send()
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(expectedCode);
  }
}
