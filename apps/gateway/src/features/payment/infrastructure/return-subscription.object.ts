import { Prisma } from '@prisma/client';

export const returnSubscriptionObject: Prisma.SubsriptionSelect = {
  id: true,
  period: true,
  price: true,
  name: true,
  description: true,
  createdAt: true,
};
