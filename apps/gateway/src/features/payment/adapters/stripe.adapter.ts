import { Injectable } from '@nestjs/common';
import { SubscriptionPeriod } from '@gateway/src/features/payment/types/enums';
import {
  IPaymentStrategyAdapter,
  MakePaymentType,
} from '@gateway/src/features/payment/adapters/payment.adapter';
import { StripeService } from '@app/core/stripe/stripe.service';

@Injectable()
export class StripeAdapter implements IPaymentStrategyAdapter {
  mapPeriodInterval: Record<SubscriptionPeriod, 'day' | 'week' | 'month'> = {
    [SubscriptionPeriod.DAY]: 'day',
    [SubscriptionPeriod.WEEK]: 'week',
    [SubscriptionPeriod.MONTH]: 'month',
  };

  constructor(private readonly stripeService: StripeService) {}

  async makePayment({
    referenceId,
    productName,
    price,
    redirectUrl,
    period,
  }: MakePaymentType) {
    console.log(this.stripeService);
    const checkoutSession = await this.stripeService.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
            },
            unit_amount: price,
            recurring: {
              interval: this.mapPeriodInterval[period],
            },
          },
          quantity: 1,
        },
      ],
      client_reference_id: referenceId,
      mode: 'subscription',
      success_url: `${redirectUrl}/success`,
      cancel_url: `${redirectUrl}/cancel`,
    });
    console.log('checkoutSession', checkoutSession);
    return {
      url: checkoutSession.url as string,
      providerInfo: checkoutSession,
    };
  }
}
