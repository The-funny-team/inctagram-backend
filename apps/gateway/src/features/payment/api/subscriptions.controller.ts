import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiCreateSubscriptionSwaggerDecorator } from '@gateway/src/features/payment/api/swagger/subsriptions/api-create-subscription.swagger.decorator';
import { AppAuthGuard } from '@gateway/src/features/auth/guards/accessJwt.guard';
import { ResponseCreateSubscriptionDto } from '@gateway/src/features/payment/api/dto/response-create-subscription.dto';
import { CreateSubscriptionDto } from '@gateway/src/features/payment/api/dto/create-subscription.dto';
import { Result, ResultInterceptor } from '@gateway/src/core';
import { CommandBus } from '@nestjs/cqrs';
import { CreateSubscriptionCommand } from '@gateway/src/features/payment/aplication/use-cases';
import { CurrentUserId } from '@gateway/src/core/decorators/currentUserId.decorator';
import { RedirectUrlDto } from '@libs/contracts/common/redirect-url.dto';
import { SubscriptionRepository } from '@gateway/src/features/payment/infrastructure/subsription-repository.repository';
import { ApiGetSubscriptionSwaggerDecorator } from '@gateway/src/features/payment/api/swagger/subsriptions/api-get-subscriptions.swagger.decorator';

const baseUrl = '/subscriptions';

export const endpoints = {
  getSubscription: () => `${baseUrl}`,
  createSubscription: () => `${baseUrl}`,
};

@ApiTags('Subscriptions')
@Controller(baseUrl)
export class SubscriptionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  @AppAuthGuard()
  @ApiGetSubscriptionSwaggerDecorator()
  @UseInterceptors(ResultInterceptor)
  @Get()
  async getSubscriptions(): Promise<Result<any>> {
    const subscriptions = await this.subscriptionRepository.getSubscriptions();
    return Result.Ok(subscriptions);
  }

  @AppAuthGuard()
  @ApiCreateSubscriptionSwaggerDecorator()
  @UseInterceptors(ResultInterceptor)
  @Post()
  async createSubscription(
    @Body() body: CreateSubscriptionDto,
    @CurrentUserId() userId: string,
    @Query() query: RedirectUrlDto,
  ): Promise<Result<ResponseCreateSubscriptionDto>> {
    return await this.commandBus.execute<
      CreateSubscriptionCommand,
      Result<ResponseCreateSubscriptionDto>
    >(new CreateSubscriptionCommand(userId, body, query.redirectUrl));
  }
}
