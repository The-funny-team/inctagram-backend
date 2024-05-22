import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getGlobalPrefix, randomString } from '../utils/tests.utils';
import { CreatePostDto } from '@gateway/src/features/post/dto/createPost.dto';
import { endpoints } from '@gateway/src/features/post/api/post.controller';
import { PostQueryDto } from '@gateway/src/features/post/dto/postQuery.dto';

export interface IPostTestHelper {
  postDto(): CreatePostDto;

  createPost(
    accessToken: string,
    createPostDto: any,
    config: {
      expectedCode?: number;
    },
  ): Promise<any>;

  deletePost(
    accessToken: string,
    postId: string,
    config: {
      expectedCode?: number;
    },
  ): Promise<any>;

  getPosts(
    query?: PostQueryDto,
    config?: { expectedCode?: number },
  ): Promise<any>;

  getPosts(
    query?: PostQueryDto,
    userId?: string,
    config?: { expectedCode?: number },
  ): Promise<any>;

  getPostById(id: string, config?: { expectedCode?: number }): Promise<any>;
}

export class PostTestHelper implements IPostTestHelper {
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
    accessToken: string,
    createPostDto: any,
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
    accessToken: string,
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

  async getPosts(
    query?: PostQueryDto,
    userIdOrConfig: string | { expectedCode?: number } = {},
    config: { expectedCode?: number } = {},
  ) {
    const { expectedCode, userId } = this.parseParams(userIdOrConfig, config);

    return request(this.app.getHttpServer())
      .get(
        this.globalPrefix + '/public/post' + (userId ? `/user/${userId}` : ''),
      )
      .query(query || {})
      .send()
      .expect(expectedCode);
  }

  private parseParams(
    userIdOrConfig: string | { expectedCode?: number },
    config: { expectedCode?: number },
  ) {
    let expectedCode = HttpStatus.OK;
    let userId = null;

    if (typeof userIdOrConfig === 'string') {
      userId = userIdOrConfig;
      expectedCode = config?.expectedCode ?? HttpStatus.OK;
    } else if (userIdOrConfig && typeof userIdOrConfig === 'object') {
      expectedCode = userIdOrConfig.expectedCode ?? HttpStatus.OK;
    }

    return { expectedCode, userId };
  }

  async getPostById(id: string, config: { expectedCode?: number } = {}) {
    const expectedCode = config.expectedCode ?? HttpStatus.OK;

    return request(this.app.getHttpServer())
      .get(this.globalPrefix + `/public/post/${id}`)
      .send()
      .expect(expectedCode);
  }
}
