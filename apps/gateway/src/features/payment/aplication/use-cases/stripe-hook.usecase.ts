import { Logger, RawBodyRequest } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenError, NotFoundError, Result } from '@gateway/src/core';
import { OrdersRepository } from '@gateway/src/features/payment/infrastructure/orders.repository';
import { TransactionsRepository } from '@gateway/src/features/payment/infrastructure/transactions.repository';
import { PrismaService } from '@gateway/src/core/prisma/prisma.servise';
import { PaymentAdapter } from '@gateway/src/features/payment/adapters/payment.adapter';
import { Request } from 'express';
import { StripeService } from '@app/core/stripe/stripe.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentTransactionEntity } from '@gateway/src/features/payment/domain/transaction.entity';
import { OrderEntity } from '@gateway/src/features/payment/domain/order.entity';

export class StripeHookCommand {
  constructor(public req: RawBodyRequest<Request>) {}
}

@CommandHandler(StripeHookCommand)
export class StripeHookUseCase implements ICommandHandler<StripeHookCommand> {
  logger = new Logger(StripeHookUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
    private readonly ordersRepository: OrdersRepository,
    private readonly transactionsRepository: TransactionsRepository,
    private readonly paymentAdapter: PaymentAdapter,
  ) {}

  async execute({
    req,
  }: StripeHookCommand): Promise<Result<unknown> | undefined> {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return Result.Err(new ForbiddenError('Stripe signature not found'));
    }

    try {
      const event = this.stripeService.webhooks.constructEvent(
        req.rawBody!,
        signature,
        this.configService.get<string>('STRIPE_WEBHOOK_SECRET')!,
      );

      if (
        event.type === 'checkout.session.completed' &&
        event.data.object.mode === 'subscription'
      ) {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log(session);

        return this.prisma.$transaction(
          async (client): Promise<Result<void>> => {
            if (!session.client_reference_id) {
              return Result.Err(
                new ForbiddenError('Stripe signature not valid'),
              );
            }

            const paymentTransaction =
              await this.transactionsRepository.getById(
                client,
                session.client_reference_id,
              );

            if (!paymentTransaction) {
              return Result.Err(new NotFoundError('Transaction not found'));
            }

            const transactionEntity =
              PaymentTransactionEntity.plainToClass(paymentTransaction);

            transactionEntity.confirmPaid();

            await this.transactionsRepository.update(client, transactionEntity);

            const orderEntity = OrderEntity.plainToClass(
              await this.ordersRepository.getById(
                client,
                session.client_reference_id,
              ),
            );

            if (!orderEntity) {
              return Result.Err(new NotFoundError('Order not found'));
            }

            orderEntity.confirmPaid();

            await this.ordersRepository.update(client, orderEntity);

            return Result.Ok();
          },
        );
      }
    } catch (error) {
      return Result.Err(new ForbiddenError('Stripe signature not valid'));
    }
  }
}
