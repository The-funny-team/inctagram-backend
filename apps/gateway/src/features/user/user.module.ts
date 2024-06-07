import { Module } from '@nestjs/common';
import { UserFacade } from './user.facade';
import { CqrsModule } from '@nestjs/cqrs';
import { UserQueryRepository, UserRepository } from './db';
import { UserService } from './user.service';
import { UserConfig } from './config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import {
  IsPasswordMustContain,
  IsPasswordsMatchingConstraint,
} from './decorators';
import { USER_USE_CASES } from './application';
import { ClientsModule } from '@nestjs/microservices';
import { UserController } from './api/user.controller';
import {
  FileServiceAdapter,
  getClientFileServiceConfig,
} from '@gateway/src/core';
import { PublicUserController } from '@gateway/src/features/user/api/public-user.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([getClientFileServiceConfig()]),
    CqrsModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [UserController, PublicUserController],
  providers: [
    UserConfig,
    ...USER_USE_CASES,
    UserRepository,
    UserQueryRepository,
    UserService,
    UserFacade,
    IsPasswordsMatchingConstraint,
    IsPasswordMustContain,
    FileServiceAdapter,
  ],
  exports: [UserFacade],
})
export class UserModule {}
