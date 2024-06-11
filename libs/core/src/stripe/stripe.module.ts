import { Module } from '@nestjs/common';
import { ConfigurableStripeModuleClass } from '@app/core/stripe/stripe.module-definition';
import { StripeService } from '@app/core/stripe/stripe.service';

@Module({
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule extends ConfigurableStripeModuleClass {}
