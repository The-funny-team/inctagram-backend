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

@Module({
  imports: [CqrsModule, EventEmitterModule.forRoot()],
  providers: [
    UserConfig,
    ...USER_USE_CASES,
    UserRepository,
    UserQueryRepository,
    UserService,
    UserFacade,
    IsPasswordsMatchingConstraint,
    IsPasswordMustContain,
  ],
  exports: [UserFacade],
})
export class UserModule {}
