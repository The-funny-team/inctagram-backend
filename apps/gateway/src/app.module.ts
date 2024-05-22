import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './features/auth/auth.module';
import { PrismaModule } from './core/prisma/prisma.module';
import { UserModule } from './features/user/user.module';
import { EmailManagerModule } from './core/email-manager/email-manager.module';
import { DeviceModule } from './features/device/device.module';
import { PostModule } from '@gateway/src/features/post/post.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'development'
          ? 'envs/.gateway.development.env'
          : 'envs/.gateway.env',
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    DeviceModule,
    EmailManagerModule,
    PostModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
