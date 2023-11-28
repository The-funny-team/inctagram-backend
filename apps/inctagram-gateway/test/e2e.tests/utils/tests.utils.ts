import { configApp } from '../../../src/core/config';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../../src/core/prisma/prisma.servise';
import { TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';

export function getGlobalPrefix() {
  return '/api';
}

export const getAppForE2ETesting = async (testingModule: TestingModule) => {
  const app = testingModule.createNestApplication();
  configApp(app);
  await app.init();

  await truncateDBTables(app);

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
    console.log({ error });
  }
}

export function randomString(n: number) {
  let rnd = '';
  while (rnd.length < n) rnd += Math.random().toString(36).substring(2);
  return rnd.substring(0, n);
}

export function randomUUID() {
  return uuidv4();
}

export function paramMock(mock) {
  const lastIndex = mock.calls.length - 1;
  return mock.calls[lastIndex];
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