import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserFasade } from '../../user/user.fasade';
import { LoginDto } from '../dto/login.dto';
import { UserId } from '../../user/types';

@Injectable()
export class PasswordStrategy extends PassportStrategy(Strategy) {
  constructor(private userFacade: UserFasade) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<UserId> {
    // validate input loginOrEmail and password
    const loginDto = new LoginDto(email, password);
    await loginDto.validate();

    //if input values are correct, check credentials
    const result = await this.userFacade.useCases.checkUserCredentials(
      loginDto,
    );
    // if user isn`t found in db, should take error
    if (!result.isSuccess) throw result.err;

    return result.value;
  }
}
