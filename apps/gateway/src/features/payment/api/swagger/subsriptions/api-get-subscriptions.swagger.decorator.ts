import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GetSubscriptionDto } from '@gateway/src/features/payment/api/dto/response-subscriptions.dto';

export function ApiGetSubscriptionSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get subscriptions on subscribe business plan',
    }),
    ApiOkResponse({ type: GetSubscriptionDto }),
  );
}
