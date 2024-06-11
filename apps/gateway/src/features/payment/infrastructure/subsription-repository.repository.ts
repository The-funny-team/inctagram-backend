import { Injectable } from '@nestjs/common';
import { PrismaService } from '@gateway/src/core/prisma/prisma.servise';
import { SubscriptionPaymentType } from '@gateway/src/features/payment/api/dto/create-subscription.dto';
import { ITXClientDenyList } from '@prisma/client/runtime/library';
import { PrismaClient } from '@prisma/client';
import { returnSubscriptionObject } from '@gateway/src/features/payment/infrastructure/return-subscription.object';

@Injectable()
export class SubscriptionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getByPeriod(
    client: Omit<PrismaClient, ITXClientDenyList>,
    period: SubscriptionPaymentType,
  ) {
    return client.subsription.findUnique({
      where: {
        period: period,
      },
    });
  }

  async getSubscriptions() {
    return this.prismaService.subsription.findMany({
      select: returnSubscriptionObject,
      orderBy: {
        price: 'asc',
      },
    });
  }
}
