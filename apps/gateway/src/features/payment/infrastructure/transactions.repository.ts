import { Injectable } from '@nestjs/common';
import { PrismaService } from '@gateway/src/core/prisma/prisma.servise';
import { PaymentTransactionEntity } from '@gateway/src/features/payment/domain/transaction.entity';

@Injectable()
export class TransactionsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(payload: PaymentTransactionEntity) {
    return this.prismaService.paymentTransaction.create({
      data: {
        ...payload,
      },
    });
  }
}
