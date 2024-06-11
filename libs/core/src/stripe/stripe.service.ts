import { Inject, Injectable } from '@nestjs/common';
import { StripeModuleOptions } from '@app/core/stripe/stripe-module-options.interface';
import { STRIPE_MODULE_OPTIONS_TOKEN } from '@app/core/stripe/stripe.module-definition';

import Stripe from 'stripe';

@Injectable()
export class StripeService extends Stripe {
  constructor(
    @Inject(STRIPE_MODULE_OPTIONS_TOKEN) private options: StripeModuleOptions,
  ) {
    options.secretKey =
      'sk_test_51PP3GGGxJGQM9duTP5XtViIY0XjmMep6Hwzc8RcpvDMnUhflHTgqe0IEY5Bo2pEEZk7u5l8mqRw9x1NLQkyQJ7p700Nmb6yYuk';
    console.log(options);
    if (!options.secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }
    super(options.secretKey, { apiVersion: '2024-04-10' });
  }
}
