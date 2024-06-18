export const PAID_BUSINESS_SUBSCRIPTION_EVENT_NAME = 'subscription.create';

export class PaidBusinessSubscriptionEvent {
  constructor(
    public readonly email: string,
    public readonly period: string,
    public readonly subscribeTo: string,
  ) {}
}
