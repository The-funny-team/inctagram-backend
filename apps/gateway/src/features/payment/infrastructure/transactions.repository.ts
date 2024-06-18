import { Injectable } from '@nestjs/common';
import { PrismaService } from '@gateway/src/core/prisma/prisma.servise';
import { PaymentTransactionEntity } from '@gateway/src/features/payment/domain/transaction.entity';
import { PaymentTransaction, PrismaClient } from '@prisma/client';
import { ITXClientDenyList } from '@prisma/client/runtime/library';

@Injectable()
export class TransactionsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(payload: PaymentTransactionEntity) {
    return this.prismaService.paymentTransaction.create({
      data: payload,
    });
  }

  async update(
    client: Omit<PrismaClient, ITXClientDenyList>,
    payload: PaymentTransactionEntity,
  ) {
    return client.paymentTransaction.update({
      where: {
        id: payload.id,
      },
      data: payload,
    });
  }

  async getById(
    client: Omit<PrismaClient, ITXClientDenyList>,
    id: string,
  ): Promise<PaymentTransaction | null> {
    return client.paymentTransaction.findUnique({
      where: {
        id,
      },
    });
  }
}
