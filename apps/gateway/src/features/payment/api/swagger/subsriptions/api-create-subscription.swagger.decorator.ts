import { applyDecorators } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { CreateSubscriptionDto } from '@gateway/src/features/payment/api/dto/create-subscription.dto';

export function ApiCreateSubscriptionSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create payment subscriptions',
    }),
    ApiCreatedResponse({ type: CreateSubscriptionDto }),
  );
}
