import { Test, TestingModule } from '@nestjs/testing';
import { INestMicroservice } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { Transport } from '@nestjs/microservices';

describe('InctagramUploadFilesController (e2e)', () => {
  let app: INestMicroservice;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await moduleFixture.createNestMicroservice({
      transport: Transport.TCP,
      options: {
        host: process.env.FILE_SERVICE_HOST || '0.0.0.0',
        port: Number(process.env.FILE_SERVICE_PORT || '3196'),
      },
    });
    await app.listen();
  });

  it('/ (GET)', () => {
    expect(2).toBe(2);
  });

  afterAll(async () => {
    await app.close();
  });
});
