import { AggregateRoot } from '@nestjs/cqrs';
import { $Enums, Order } from '@prisma/client';
import { plainToClass } from 'class-transformer';

export class CreateOrder {
  userId: Order['userId'];
  totalPrice: Order['totalPrice'];
  subscriptionId: Order['subscriptionId'];
}

export class OrderEntity extends AggregateRoot implements Partial<Order> {
  id?: Order['id'];
  status: Order['status'];
  userId: Order['userId'];
  totalPrice: Order['totalPrice'];
  subscriptionId: Order['subscriptionId'];

  constructor({ userId, totalPrice, subscriptionId }: CreateOrder) {
    super();

    this.status = 'PENDING';
    this.totalPrice = totalPrice;
    this.userId = userId;
    this.subscriptionId = subscriptionId;
  }

  static createOrder(payload: CreateOrder): OrderEntity {
    return new OrderEntity(payload);
  }

  static plainToClass<T extends Partial<Order> & { id: string }>(
    payload: T | null,
  ): OrderEntity {
    return plainToClass(OrderEntity, payload);
  }

  confirmPaid() {
    this.status = $Enums.OrderStatus.PAID;
  }
}
