import { Module } from '@nestjs/common';
import {
  SubscriptionsController,
  SubscriptionsHooksController,
} from '@gateway/src/features/payment/api';
import { TransactionsRepository } from '@gateway/src/features/payment/infrastructure/transactions.repository';
import { OrdersRepository } from '@gateway/src/features/payment/infrastructure/orders.repository';
import { SubscriptionRepository } from '@gateway/src/features/payment/infrastructure/subsription-repository.repository';
import { useCases } from '@gateway/src/features/payment/aplication/use-cases';
import { StripeModule } from '@app/core/stripe/stripe.module';
import { ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentAdapter } from '@gateway/src/features/payment/adapters/payment.adapter';
import { StripeAdapter } from '@gateway/src/features/payment/adapters/stripe.adapter';
import { SubscriptionQueryRepository } from '@gateway/src/features/payment/infrastructure/subsription.query.repository';

@Module({
  imports: [
    CqrsModule,
    StripeModule.registerAsync({
      useFactory: async (config: ConfigService) => {
        return {
          secretKey: config.get<string>('STRIPE_SECRET_KEY'),
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [SubscriptionsController, SubscriptionsHooksController],
  providers: [
    ...useCases,
    TransactionsRepository,
    OrdersRepository,
    SubscriptionRepository,
    SubscriptionQueryRepository,
    PaymentAdapter,
    StripeAdapter,
  ],
})
export class PaymentModule {}
