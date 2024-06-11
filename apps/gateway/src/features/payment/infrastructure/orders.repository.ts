import { Injectable } from '@nestjs/common';
import { PrismaService } from '@gateway/src/core/prisma/prisma.servise';
import { OrderEntity } from '@gateway/src/features/payment/domain/order.entity';

@Injectable()
export class OrdersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(payload: OrderEntity) {
    return this.prismaService.order.create({
      data: payload,
    });
  }
}
