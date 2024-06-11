import { ConfigurableModuleBuilder } from '@nestjs/common';
import { StripeModuleOptions } from '@app/core/stripe/stripe-module-options.interface';

export const {
  ConfigurableModuleClass: ConfigurableStripeModuleClass,
  MODULE_OPTIONS_TOKEN: STRIPE_MODULE_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder<StripeModuleOptions>().build();
