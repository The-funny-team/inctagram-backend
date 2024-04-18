import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DEVICES_USE_CASES } from './application';
import { DeviceFacade } from './device.facade';
import { JWTModule } from '../../core/jwt-adapter/jwt.module';
import { DeviceRepository } from './db';

@Module({
  imports: [CqrsModule, JWTModule],
  providers: [...DEVICES_USE_CASES, DeviceFacade, DeviceRepository],
  exports: [DeviceFacade],
})
export class DeviceModule {}
