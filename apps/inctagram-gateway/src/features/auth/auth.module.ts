import { Module } from '@nestjs/common';
import { AuthController } from './api';
import { UserModule } from '../user/user.module';
import { DeviceModule } from '../device/device.module';
import { STRATEGIES } from './strategies/idex';
import { JWTModule } from '../../core/jwt-adapter/jwt.module';
import { AuthService } from './auth.service';
import { AUTH_USE_CASES } from './application';
import { GoogleOauth2Config } from '../device/config';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [CqrsModule, UserModule, DeviceModule, JWTModule, HttpModule],
  controllers: [AuthController],
  providers: [
    ...STRATEGIES,
    ...AUTH_USE_CASES,
    AuthService,
    GoogleOauth2Config,
  ],
})
export class AuthModule {}
