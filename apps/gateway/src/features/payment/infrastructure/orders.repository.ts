import { Injectable } from '@nestjs/common';
import { PrismaService } from '@gateway/src/core/prisma/prisma.servise';
import { OrderEntity } from '@gateway/src/features/payment/domain/order.entity';
import { Order, PrismaClient } from '@prisma/client';
import { ITXClientDenyList } from '@prisma/client/runtime/library';

@Injectable()
export class OrdersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(payload: OrderEntity) {
    return this.prismaService.order.create({
      data: payload,
    });
  }

  async getById(
    client: Omit<PrismaClient, ITXClientDenyList>,
    id: string,
  ): Promise<Order | null> {
    return client.order.findUnique({
      where: {
        id,
      },
    });
  }

  async update(
    client: Omit<PrismaClient, ITXClientDenyList>,
    payload: OrderEntity,
  ) {
    return client.order.update({
      where: {
        id: payload.id,
      },
      data: payload,
    });
  }
}
