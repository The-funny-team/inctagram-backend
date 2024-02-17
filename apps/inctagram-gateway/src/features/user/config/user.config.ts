import { Injectable } from '@nestjs/common';

@Injectable()
export class UserConfig {
  getConfirmationCodeLifetime() {
    return { minutes: 5 };
  }
  getRecoveryCodeLifetime() {
    return { minutes: 5 };
  }
}
