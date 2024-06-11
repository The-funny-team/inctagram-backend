import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const dailySubscription = await prisma.subsription.upsert({
    where: { period: 'DAY' },
    update: {
      description: 'Daily Subscription',
      price: 100 * 10,
    },
    create: {
      name: 'Daily Subscription',
      description: 'Daily Subscription',
      price: 100 * 10,
      period: 'DAY',
    },
  });
  const weeklySubscription = await prisma.subsription.upsert({
    where: { period: 'WEEK' },
    update: {
      description: 'Weekly Subscription',
      price: 100 * 50,
    },
    create: {
      name: 'Weekly Subscription',
      description: 'Weekly Subscription',
      price: 100 * 50,
      period: 'WEEK',
    },
  });
  const monthlySubscription = await prisma.subsription.upsert({
    where: { period: 'MONTH' },
    update: {
      description: 'Monthly Subscription',
      price: 100 * 100,
    },
    create: {
      name: 'Monthly Subscription',
      description: 'Monthly Subscription',
      price: 100 * 100,
      period: 'MONTH',
    },
  });

  console.log({ dailySubscription, weeklySubscription, monthlySubscription });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
