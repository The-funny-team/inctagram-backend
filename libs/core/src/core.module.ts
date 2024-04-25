import { Module } from '@nestjs/common';
import { CoreService } from './core.service';
import { AppConfigModule } from './config/appConfigModule';

@Module({
  providers: [CoreService],
  exports: [CoreService],
  imports: [AppConfigModule],
})
export class CoreModule {}
