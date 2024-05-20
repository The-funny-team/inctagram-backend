import { Module } from '@nestjs/common';
import { FilesModule } from './files/files.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConfigService } from './configs/mongo.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'development'
          ? 'envs/.upload.files.development.env'
          : 'envs/.upload.files.env',
    }),
    MongooseModule.forRootAsync({ useClass: MongooseConfigService }),
    FilesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
