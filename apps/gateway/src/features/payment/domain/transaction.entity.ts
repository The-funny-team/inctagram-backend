import { AggregateRoot } from '@nestjs/cqrs';
import { PaymentTransaction } from '@prisma/client';

export class CreatePaymentTransaction {
  userId: PaymentTransaction['userId'];
  system: PaymentTransaction['system'];
  orderId: PaymentTransaction['orderId'];
  providerInfo?: PaymentTransaction['providerInfo'];
  // confirmationInfo?: PaymentTransaction['confirmationInfo'];
  subscriptionId?: PaymentTransaction['subscriptionId'];
}

export class PaymentTransactionEntity
  extends AggregateRoot
  implements Partial<PaymentTransaction>
{
  userId: PaymentTransaction['userId'];
  system: PaymentTransaction['system'];
  status: PaymentTransaction['status'];
  orderId: PaymentTransaction['orderId'];
  providerInfo?: string;
  // confirmationInfo?: PaymentTransaction['confirmationInfo'];
  subscriptionId?: PaymentTransaction['subscriptionId'];

  constructor({
    userId,
    system,
    orderId,
    providerInfo,
    // confirmationInfo,
    subscriptionId,
  }: CreatePaymentTransaction) {
    super();

    this.status = 'PENDING';
    this.userId = userId;
    this.system = system;
    this.orderId = orderId;
    this.providerInfo = providerInfo ? JSON.stringify(providerInfo) : undefined;
    this.subscriptionId = subscriptionId;
  }

  static create(payload: CreatePaymentTransaction): PaymentTransactionEntity {
    return new PaymentTransactionEntity(payload);
  }

  setProviderInfo(providerInfo: string) {
    this.providerInfo = providerInfo;
  }
}
