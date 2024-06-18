import { Injectable } from '@nestjs/common';
import { PrismaService } from '@gateway/src/core/prisma/prisma.servise';
import { returnSubscriptionObject } from '@gateway/src/features/payment/infrastructure/return-subscription.object';
import { Result } from '@gateway/src/core';
import { ResponseSubscriptionDto } from '@gateway/src/features/payment/api/dto/response-subscriptions.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class SubscriptionQueryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getSubscriptions(): Promise<Result<ResponseSubscriptionDto[]>> {
    const subscriptions = await this.prismaService.subsription.findMany({
      select: returnSubscriptionObject,
      orderBy: {
        price: 'asc',
      },
    });

    return Result.Ok(
      subscriptions.map((subscription) => {
        return plainToClass(ResponseSubscriptionDto, subscription);
      }),
    );
  }
}
