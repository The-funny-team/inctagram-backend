import { Module } from '@nestjs/common';
import { SubscriptionsController } from '@gateway/src/features/payment/api/subscriptions.controller';
import { TransactionsRepository } from '@gateway/src/features/payment/infrastructure/transactions.repository';
import { OrdersRepository } from '@gateway/src/features/payment/infrastructure/orders.repository';
import { SubscriptionRepository } from '@gateway/src/features/payment/infrastructure/subsription-repository.repository';
import { useCases } from '@gateway/src/features/payment/aplication/use-cases';
import { StripeModule } from '@app/core/stripe/stripe.module';
import { ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentAdapter } from '@gateway/src/features/payment/adapters/payment.adapter';
import { StripeAdapter } from '@gateway/src/features/payment/adapters/stripe.adapter';

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
  controllers: [SubscriptionsController],
  providers: [
    ...useCases,
    TransactionsRepository,
    OrdersRepository,
    SubscriptionRepository,
    PaymentAdapter,
    StripeAdapter,
  ],
})
export class PaymentModule {}
