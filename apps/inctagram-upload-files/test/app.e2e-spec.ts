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
        host: '0.0.0.0',
        port: 3196,
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
