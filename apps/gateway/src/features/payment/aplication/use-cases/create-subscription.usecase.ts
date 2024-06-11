import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundError, Result } from '@gateway/src/core';
import {
  CreateSubscriptionDto,
  PaymentType,
} from '@gateway/src/features/payment/api/dto/create-subscription.dto';
import { SubscriptionRepository } from '@gateway/src/features/payment/infrastructure/subsription-repository.repository';
import { OrdersRepository } from '@gateway/src/features/payment/infrastructure/orders.repository';
import { TransactionsRepository } from '@gateway/src/features/payment/infrastructure/transactions.repository';
import { StripeService } from '@app/core/stripe/stripe.service';
import { OrderEntity } from '@gateway/src/features/payment/domain/order.entity';
import { PaymentTransactionEntity } from '@gateway/src/features/payment/domain/transaction.entity';
import { ResponseCreateSubscriptionDto } from '@gateway/src/features/payment/api/dto/response-create-subscription.dto';
import { PrismaService } from '@gateway/src/core/prisma/prisma.servise';
import { PaymentAdapter } from '@gateway/src/features/payment/adapters/payment.adapter';

export class CreateSubscriptionCommand {
  constructor(
    public userId: string,
    public data: CreateSubscriptionDto,
    public redirectUrl: string,
  ) {}
}

@CommandHandler(CreateSubscriptionCommand)
export class CreateSubscriptionUseCase
  implements ICommandHandler<CreateSubscriptionCommand>
{
  logger = new Logger(CreateSubscriptionUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
    private readonly productsRepository: SubscriptionRepository,
    private readonly ordersRepository: OrdersRepository,
    private readonly transactionsRepository: TransactionsRepository,
    private readonly paymentAdapter: PaymentAdapter,
  ) {}

  async execute({
    userId,
    data,
    redirectUrl,
  }: CreateSubscriptionCommand): Promise<
    Result<ResponseCreateSubscriptionDto | unknown>
  > {
    const urlOrResultError = await this.prisma.$transaction(
      async (
        client,
      ): Promise<Result<ResponseCreateSubscriptionDto> | string> => {
        const subscription = await this.productsRepository.getByPeriod(
          client,
          data.subscriptionPaymentType,
        );

        if (!subscription) {
          return Result.Err(new NotFoundError('Subscription not found'));
        }

        const order = OrderEntity.createOrder({
          userId,
          totalPrice: subscription.price,
          subscriptionId: subscription.id,
        });

        const savedOrder = await this.ordersRepository.create(order);

        const transaction = PaymentTransactionEntity.create({
          userId,
          system: PaymentType.PAYPAL,
          orderId: savedOrder.id,
        });

        const { providerInfo, url } = await this.paymentAdapter.makePayment({
          referenceId: savedOrder.id,
          productName: subscription.name,
          price: subscription.price,
          period: subscription.period,
          redirectUrl,
        });

        transaction.setProviderInfo(JSON.stringify(providerInfo));

        await this.transactionsRepository.create(transaction);

        return url;
      },
    );

    if (urlOrResultError instanceof Result) {
      return urlOrResultError;
    }

    return Result.Ok({
      url: urlOrResultError,
    });
  }
}
