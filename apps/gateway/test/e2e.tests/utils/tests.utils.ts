import { APP_GLOBAL_PREFIX, configApp } from '../../../src/core/config';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../../src/core/prisma/prisma.servise';
import { TestingModule } from '@nestjs/testing';

export function getGlobalPrefix() {
  return APP_GLOBAL_PREFIX;
}

export const getAppForE2ETesting = async (testingModule: TestingModule) => {
  const app = testingModule.createNestApplication();
  configApp(app);
  await app.init();

  const developmentMode = process.env.NODE_ENV
    ? process.env.NODE_ENV === 'development'
    : false;
  if (developmentMode) {
    await truncateDBTables(app);
  }

  return app;
};

async function truncateDBTables(app: INestApplication) {
  const prisma = app.get<PrismaService>(PrismaService);

  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.error({ error });
  }
}

export function randomString(n: number) {
  let rnd = '';
  while (rnd.length < n) rnd += Math.random().toString(36).substring(2);
  return rnd.substring(0, n);
}

export function getErrorMessagesBadRequest() {
  return {
    timestamp: expect.any(String),
    path: expect.any(String),
    message: [
      {
        field: '',
        message: expect.any(String),
      },
    ],
  };
}

export function findUUIDv4(message: string) {
  const res: any =
    /[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}/i.exec(
      message,
    );
  return res.length ? res[0] : '';
}
