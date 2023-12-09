import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { UserConfig } from './config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  USER_CREATED_EVENT_NAME,
  USER_UPDATED_EVENT_NAME,
  UserInfoCreatedEvent,
  UserInfoUpdatedEvent,
} from './application';
import { UserRepository } from './db';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly userConfig: UserConfig,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  generatePasswordHash(password: string): string {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  }

  isCorrectPassword(password: string, hashPassword: string): boolean {
    return bcrypt.compareSync(password, hashPassword);
  }

  generateConfirmationCode(): {
    code: string;
    expiration: Date;
  } {
    return {
      code: uuidv4(),
      expiration: add(
        new Date(),
        this.userConfig.getConfirmationCodeLifetime(),
      ),
    };
  }

  createUserInfoCreatedEvent(email: string, confirmationCode: string) {
    this.eventEmitter.emit(
      USER_CREATED_EVENT_NAME,
      new UserInfoCreatedEvent(email, confirmationCode),
    );
  }

  createUserInfoUpdatedEvent(email: string, confirmationCode: string) {
    this.eventEmitter.emit(
      USER_UPDATED_EVENT_NAME,
      new UserInfoUpdatedEvent(email, confirmationCode),
    );
  }

  async updateConfirmationCode(userInfoId: string, email: string) {
    const confirmationCode = this.generateConfirmationCode();
    const updatedUserInfo = await this.userRepo.updateRegistrationInfo(
      userInfoId,
      {
        confirmationCode: confirmationCode.code,
        expirationConfirmationCode: confirmationCode.expiration,
      },
    );
    this.createUserInfoUpdatedEvent(email, confirmationCode.code);
    return updatedUserInfo;
  }
}
