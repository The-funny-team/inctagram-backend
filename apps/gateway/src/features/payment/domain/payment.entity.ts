import { AggregateRoot } from '@nestjs/cqrs';
import { Order } from '@prisma/client';

export class CreateOrder {
  userId: Order['userId'];
  totalPrice: Order['totalPrice'];
  subscriptionId: Order['subscriptionId'];
}

export class OrderEntity extends AggregateRoot implements Partial<Order> {
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
}
