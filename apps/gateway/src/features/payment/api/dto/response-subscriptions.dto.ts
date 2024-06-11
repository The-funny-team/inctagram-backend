import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { SubscriptionPaymentType } from '@gateway/src/features/payment/api/dto/create-subscription.dto';

export class GetSubscriptionDto {
  @ApiProperty({
    description: 'Identifier',
  })
  id: string;

  @ApiProperty({
    description: 'Subscription payment period',
    enum: [
      SubscriptionPaymentType.MONTHLY,
      SubscriptionPaymentType.WEEKLY,
      SubscriptionPaymentType.DAY,
    ],
  })
  @IsEnum(SubscriptionPaymentType)
  period: SubscriptionPaymentType;

  @ApiProperty({
    description: 'Price in cents',
  })
  price: number;

  @ApiProperty({
    description: 'Subscription name',
  })
  name: number;

  @ApiProperty({
    description: 'Subscription description',
  })
  description: number;

  @ApiProperty({
    description: 'Subscription created at',
  })
  created_at: number;
}
