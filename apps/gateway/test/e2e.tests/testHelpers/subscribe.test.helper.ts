import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getGlobalPrefix } from '../utils/tests.utils';
import { endpoints as subscriptionEndpoints } from '@gateway/src/features/payment/api/subscriptions.controller';
import { CreateSubscriptionDto } from '@gateway/src/features/payment/api/dto/create-subscription.dto';
import { ResponseCreateSubscriptionDto } from '@gateway/src/features/payment/api/dto/response-create-subscription.dto';

export class SubscribeTestHelper {
  private globalPrefix = getGlobalPrefix();

  constructor(private app: INestApplication) {}

  async subscribe(
    accessToken: string,
    body: CreateSubscriptionDto,
    redirectUrl: string,
    config: {
      expectedCode?: number;
    } = {},
  ): Promise<ResponseCreateSubscriptionDto> {
    const expectedCode = config.expectedCode ?? HttpStatus.CREATED;
    const response = await request(this.app.getHttpServer())
      .post(
        this.globalPrefix +
          subscriptionEndpoints.createSubscription() +
          '?redirectUrl=' +
          redirectUrl,
      )
      .auth(accessToken, { type: 'bearer' })
      .send(body);

    expect(response.status).toBe(expectedCode);

    return response.body;
  }

  async getSubscriptions(
    accessToken: string,
    config: {
      expectedCode?: number;
    } = {},
  ): Promise<any[]> {
    const expectedCode = config.expectedCode ?? HttpStatus.OK;
    return request(this.app.getHttpServer())
      .get(this.globalPrefix + subscriptionEndpoints.getSubscription())
      .auth(accessToken, { type: 'bearer' })
      .expect(expectedCode)
      .then(({ body }) => body);
  }
}
