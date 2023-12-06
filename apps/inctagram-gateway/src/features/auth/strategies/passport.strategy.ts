import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserFacade } from '../../user/user.facade';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class PasswordStrategy extends PassportStrategy(Strategy) {
  constructor(private userFacade: UserFacade) {
    super({
      usernameField: 'email',
    });
  }

  async validate(
    email: string,
    password: string,
  ): Promise<{ id: string } | any> {
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
