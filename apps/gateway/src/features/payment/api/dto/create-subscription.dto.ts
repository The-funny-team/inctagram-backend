import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum PaymentType {
  PAYPAL = 'PAYPAL',
  STRIPE = 'STRIPE',
}

export enum SubscriptionPaymentType {
  MONTHLY = 'MONTH',
  WEEKLY = 'WEEK',
  DAY = 'DAY',
}

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Payment type',
    enum: ['PAYPAL', 'STRIPE'],
  })
  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @ApiProperty({
    description: 'Subscription payment type',
    enum: [
      SubscriptionPaymentType.MONTHLY,
      SubscriptionPaymentType.WEEKLY,
      SubscriptionPaymentType.DAY,
    ],
  })
  @IsEnum(SubscriptionPaymentType)
  subscriptionPaymentType: SubscriptionPaymentType;
}
