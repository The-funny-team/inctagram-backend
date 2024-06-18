import { AggregateRoot } from '@nestjs/cqrs';
import { $Enums, PaymentTransaction } from '@prisma/client';
import { plainToClass } from 'class-transformer';

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
  id?: PaymentTransaction['id'];
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

    this.status = $Enums.PaymentStatus.PENDING;
    this.userId = userId;
    this.system = system;
    this.orderId = orderId;
    this.providerInfo = providerInfo ? JSON.stringify(providerInfo) : undefined;
    this.subscriptionId = subscriptionId;
  }

  static create(payload: CreatePaymentTransaction): PaymentTransactionEntity {
    return new PaymentTransactionEntity(payload);
  }

  static plainToClass<T extends Partial<PaymentTransaction> & { id: string }>(
    payload: T,
  ): PaymentTransactionEntity {
    return plainToClass(PaymentTransactionEntity, payload);
  }

  setProviderInfo(providerInfo: string) {
    this.providerInfo = providerInfo;
  }

  confirmPaid() {
    this.status = $Enums.PaymentStatus.PAID;
  }

  cancelPaid() {
    this.status = $Enums.PaymentStatus.CANCELED;
  }
}
