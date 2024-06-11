import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './features/auth/auth.module';
import { PrismaModule } from './core/prisma/prisma.module';
import { UserModule } from './features/user/user.module';
import { EmailManagerModule } from './core/email-manager/email-manager.module';
import { DeviceModule } from './features/device/device.module';
import { PostModule } from '@gateway/src/features/post/post.module';
import { PaymentModule } from '@gateway/src/features/payment/payment.module';

console.log('process.env.NODE_ENV', process.env.NODE_ENV);

const env = {
  development: 'envs/.gateway.development.env',
  test: 'envs/.gateway.test.env',
  default: 'envs/.gateway.env',
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        env[process.env.NODE_ENV as 'development' | 'test'] || env.default,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    DeviceModule,
    EmailManagerModule,
    PostModule,
    PaymentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
