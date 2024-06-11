import { AggregateRoot } from '@nestjs/cqrs';
import { Order } from '@prisma/client';

export class CreateOrder {
  userId: Order['user_id'];
  totalPrice: Order['total_price'];
  subscriptionId: Order['subscription_id'];
}

export class OrderEntity extends AggregateRoot implements Partial<Order> {
  status: Order['status'];
  user_id: Order['user_id'];
  total_price: Order['total_price'];
  subscription_id: Order['subscription_id'];

  constructor({ userId, totalPrice, subscriptionId }: CreateOrder) {
    super();

    this.status = 'PENDING';
    this.total_price = totalPrice;
    this.user_id = userId;
    this.subscription_id = subscriptionId;
  }

  static createOrder(payload: CreateOrder): OrderEntity {
    return new OrderEntity(payload);
  }
}
