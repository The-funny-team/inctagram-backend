import { Module } from '@nestjs/common';
import { AppConfigService } from '@app/core/config/app-config.service';
// import { ConfigModule } from '@nestjs/config';

// todo: Доделать
@Module({
  imports: [
    // ConfigModule.forRoot({
    //   isGlobal: true,
    //   envFilePath:
    //     process.env.NODE_ENV === 'development'
    //       ? 'envs/.gateway.development.env'
    //       : 'envs/.upload.files.env',
    // }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
