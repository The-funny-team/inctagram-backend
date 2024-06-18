import {
  Controller,
  Post,
  RawBodyRequest,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { Result, ResultInterceptor } from '@gateway/src/core';
import { CommandBus } from '@nestjs/cqrs';
import { Request } from 'express';
import { StripeHookCommand } from '@gateway/src/features/payment/aplication/use-cases/stripe-hook.usecase';

const baseUrl = '/subscriptions/hooks';

export const subscriptionsHooksEndpoints = {
  stripeHook: () => `${baseUrl}/stripe`,
};

@Controller(baseUrl)
export class SubscriptionsHooksController {
  constructor(private readonly commandBus: CommandBus) {}

  // @AppAuthGuard()
  // @ApiCreateSubscriptionSwaggerDecorator()
  @UseInterceptors(ResultInterceptor)
  @Post('/stripe')
  async stripeHook(@Req() req: RawBodyRequest<Request>): Promise<Result<void>> {
    return await this.commandBus.execute<StripeHookCommand, Result<void>>(
      new StripeHookCommand(req),
    );
  }
}
