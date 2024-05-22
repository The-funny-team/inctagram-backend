import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { EmailManagerModule } from '../../src/core/email-manager/email-manager.module';
import { AppModule } from '../../src/app.module';
import { getAppForE2ETesting } from '../e2e.tests/utils/tests.utils';
import { EmailAdapter } from '@gateway/src/core/email-manager/email.adapter';

describe('Auth.integration', () => {
  let app: INestApplication;

  const emailAdapterMock = {
    sendEmailConfirmationCode: jest.fn(),
    sendRecoveryPasswordTempCode: jest.fn(),
  };

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      imports: [EmailManagerModule, AppModule],
    })
      .overrideProvider(EmailAdapter)
      .useValue(emailAdapterMock)
      .compile();

    app = await getAppForE2ETesting(testingModule);
  });

  afterAll(async () => {
    await app.close();
  });

  it('Some test', () => {
    expect(2).toBe(2);
  });
});
