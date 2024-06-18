import { CreateSubscriptionUseCase } from '@gateway/src/features/payment/aplication/use-cases/create-subscription.usecase';
import { StripeHookUseCase } from '@gateway/src/features/payment/aplication/use-cases/stripe-hook.usecase';

export const useCases = [CreateSubscriptionUseCase, StripeHookUseCase];
