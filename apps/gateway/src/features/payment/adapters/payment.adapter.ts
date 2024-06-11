import { Injectable } from '@nestjs/common';
import { StripeAdapter } from '@gateway/src/features/payment/adapters/stripe.adapter';
import { $Enums } from '@prisma/client';

export type MakePaymentType = {
  referenceId: string;
  productName: string;
  price: number;
  period: $Enums.SubsriptionPeriod;
  redirectUrl: string;
};

export interface IPaymentStrategyAdapter {
  makePayment({
    referenceId,
    productName,
    price,
    redirectUrl,
    period,
  }: MakePaymentType): Promise<{ url: string; providerInfo: any }>;
}

@Injectable()
export class PaymentAdapter implements IPaymentStrategyAdapter {
  constructor(private readonly stripe: StripeAdapter) {}

  async makePayment(payload: MakePaymentType) {
    return this.stripe.makePayment(payload);
  }
}
