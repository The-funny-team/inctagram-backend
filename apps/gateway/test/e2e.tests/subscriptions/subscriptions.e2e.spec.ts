import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '@gateway/src/app.module';
import { EmailManagerModule } from '@gateway/src/core/email-manager/email-manager.module';
import { AuthTestHelper } from '@gateway/test/e2e.tests/testHelpers/auth.test.helper';
import { getAppForE2ETesting } from '@gateway/test/e2e.tests/utils/tests.utils';
import { EmailAdapter } from '@gateway/src/core/email-manager/email.adapter';
import { SubscribeTestHelper } from '@gateway/test/e2e.tests/testHelpers/subscribe.test.helper';
import {
  PaymentType,
  SubscriptionPaymentType,
} from '@gateway/src/features/payment/api/dto/create-subscription.dto';
import { StripeService } from '@app/core/stripe/stripe.service';

jest.setTimeout(15000);

describe('Subscriptions (e2e) test', () => {
  let app: INestApplication;
  let authTestHelper: AuthTestHelper;
  let subscribeTestHelper: SubscribeTestHelper;

  let accessToken: string;

  const emailAdapterMock = {
    sendEmailConfirmationCode: jest.fn(),
    sendRecoveryPasswordTempCode: jest.fn(),
  };

  const stripeServiceMock = {
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          url: 'https://mock-stripe-session-url.com',
          providerInfo: '',
          // Другие свойства сессии, которые могут быть полезны для тестирования
        }),
      },
    },
  };

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      imports: [EmailManagerModule, AppModule],
    })
      .overrideProvider(EmailAdapter)
      .useValue(emailAdapterMock)
      .overrideProvider(StripeService)
      .useValue(stripeServiceMock)
      .compile();

    app = await getAppForE2ETesting(testingModule);

    authTestHelper = new AuthTestHelper(app);
    subscribeTestHelper = new SubscribeTestHelper(app);
  });

  beforeEach(async () => {
    const { accessToken: _accessToken } =
      await authTestHelper.registrationUserAndLogin({
        emailAdapterMock,
      });

    accessToken = _accessToken;

    jest.clearAllMocks();
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const { accessToken: _accessToken } =
      await authTestHelper.registrationUserAndLogin({
        emailAdapterMock,
      });

    accessToken = _accessToken;
  });

  it(`(POST) Subscribe on business plan with Stripe payment system`, async () => {
    const subscriptions =
      await subscribeTestHelper.getSubscriptions(accessToken);

    const redirectUrl = 'http://127.0.0.1:3000';
    const subscription = await subscribeTestHelper.subscribe(
      accessToken,
      {
        subscriptionPaymentType: SubscriptionPaymentType.DAY,
        paymentType: PaymentType.STRIPE,
      },
      redirectUrl,
    );

    console.log('subscriptions', subscriptions);

    const daySubscription = subscriptions.find(
      (sub) => sub.period === SubscriptionPaymentType.DAY,
    );

    expect(stripeServiceMock.checkout.sessions.create).toHaveBeenCalledWith({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: daySubscription.name,
            },
            unit_amount: daySubscription.price,
            recurring: {
              interval: 'day',
            },
          },
          quantity: 1,
        },
      ],
      client_reference_id: expect.any(String),
      mode: 'subscription',
      success_url: `${redirectUrl}/success`,
      cancel_url: `${redirectUrl}/cancel`,
    });

    expect(subscription.url).not.toBeUndefined();
  });

  // fixme: This test is work if should after test is used stripeServiceMock
  it(`Get subscriptions directory`, async () => {
    const subscriptions =
      await subscribeTestHelper.getSubscriptions(accessToken);

    expect(subscriptions).toHaveLength(3);
    expect(subscriptions[0].period).toBe(SubscriptionPaymentType.DAY);
    expect(subscriptions[1].period).toBe(SubscriptionPaymentType.WEEKLY);
    expect(subscriptions[2].period).toBe(SubscriptionPaymentType.MONTHLY);
  });
});
